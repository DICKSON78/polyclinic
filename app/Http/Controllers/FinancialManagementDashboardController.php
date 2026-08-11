<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Expense;
use App\Models\ExpensePayment;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class FinancialManagementDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $today = Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Default to today if no dates provided
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Get financial statistics
        // Total revenue: actual payments linked to cache items (no orphans, no bill face values)
        try {
            $revenueQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                });
            
            if ($clinic_id) {
                $revenueQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Use net amount (amount - discount) to match Daily Cash Collection subtotal
            $itemPaymentsRevenue = (float) ($revenueQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);

            // Add actual bill payments
            $billRevenueQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                });
            
            if ($clinic_id) {
                $billRevenueQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $billPaymentsRevenue = (float) $billRevenueQuery->sum('patient_item_bill_payments.amount');
            $data['summary']['total_revenue'] = $itemPaymentsRevenue + $billPaymentsRevenue;
        } catch (\Exception $e) {
            \Log::error('Error calculating total revenue', ['error' => $e->getMessage()]);
            $data['summary']['total_revenue'] = 0;
        }

        // Total expenses: sum of actual expense payments
        try {
            $expensesQuery = ExpensePayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['total_expenses'] = $expensesQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating total expenses', ['error' => $e->getMessage()]);
            $data['summary']['total_expenses'] = 0;
        }

        $data['summary']['net_profit'] = $data['summary']['total_revenue'] - $data['summary']['total_expenses'];

        // Daily collections: actual payments linked to cache items
        try {
            $dailyItemQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                });
            
            if ($clinic_id) {
                $dailyItemQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Use net amount (amount - discount) to match Daily Cash Collection subtotal
            $dailyCollections = (float) ($dailyItemQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);

            // Add bill payments
            $dailyBillQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                });
            
            if ($clinic_id) {
                $dailyBillQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $billPaymentsCollections = (float) $dailyBillQuery->sum('patient_item_bill_payments.amount');
            $data['summary']['daily_collections'] = $dailyCollections + $billPaymentsCollections;
        } catch (\Exception $e) {
            \Log::error('Error calculating daily collections', ['error' => $e->getMessage()]);
            $data['summary']['daily_collections'] = 0;
        }

        // Pending bills: total amount of bills with status 'Pending' created in date range
        $data['summary']['pending_bills'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        // Get expense payments count (for statistics)
        try {
            $expensePaymentsCountQuery = ExpensePayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $expensePaymentsCountQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['expense_payments_count'] = $expensePaymentsCountQuery->count();
        } catch (\Exception $e) {
            \Log::error('Error calculating expense payments count', ['error' => $e->getMessage()]);
            $data['summary']['expense_payments_count'] = 0;
        }
        
        $data['summary']['expense_payments'] = $data['summary']['total_expenses'];

        // Running Cost & Improvement Cost (by explicit flag OR category match)
        // Running costs = ongoing operational expenses (maintenance, software)
        // Improvement costs = capital/one-time expenditures (renovation, furniture, importation, events)
        $runningCostCategories = [
            'Cleanless, technical / mechanical meintenance', 
            'Office Software', 
            'Daily expenses', 
            'Electricity', 
            'Ground Floor Rent', 
            'Rent', 
            'Salary', 
            'Staff Allowance & Chakula', 
            'Transport', 
            'SODA', 
            'Marketing', 
            'Government Tax'
        ];
        $improvementCostCategories = [
            'Renovation', 
            'Vifaa & Furnitures', 
            'Importation Cost(Cargo transportation)', 
            'SABASABA 2025', 
            'Outreach Programs', 
            'Parnership Dissolution', 
            'Loan'
        ];
        try {
            $baseRunningQuery = DB::table('expense_payments as expp')
                ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                ->where('expp.amount', '>', 0);

            $baseImprovementQuery = clone $baseRunningQuery;

            if ($clinic_id) {
                $baseRunningQuery->join('users as u', 'expp.created_by', '=', 'u.id')
                    ->where('u.clinic_id', $clinic_id);
                $baseImprovementQuery->join('users as u', 'expp.created_by', '=', 'u.id')
                    ->where('u.clinic_id', $clinic_id);
            }

            $runningCostQuery = (clone $baseRunningQuery)->where(function($q) use ($runningCostCategories) {
                $q->where('exp.running_cost', 1)
                  ->orWhereIn('cat.name', $runningCostCategories);
            });

            $improvementCostQuery = (clone $baseImprovementQuery)->where(function($q) use ($improvementCostCategories) {
                $q->where('exp.improvement_cost', 1)
                  ->orWhereIn('cat.name', $improvementCostCategories);
            });

            $data['summary']['running_cost'] = (float) $runningCostQuery->sum('expp.amount');
            $data['summary']['improvement_cost'] = (float) $improvementCostQuery->sum('expp.amount');
            
            \Log::info('FinancialManagementDashboard cost calculations', [
                'running_cost' => $data['summary']['running_cost'],
                'improvement_cost' => $data['summary']['improvement_cost'],
                'clinic_id' => $clinic_id,
                'start_date' => $start_date,
                'end_date' => $end_date
            ]);
        } catch (\Exception $e) {
            \Log::error('Error calculating running/improvement costs', ['error' => $e->getMessage()]);
            $data['summary']['running_cost'] = 0;
            $data['summary']['improvement_cost'] = 0;
        }

        // Get top expense categories (real data from expense_categories)
        try {
            if ($clinic_id) {
                $data['statistics']['expenses_by_category'] = DB::select('
                    SELECT exp.category_id, cat.name, SUM(expp.amount) as amount 
                    FROM expense_payments as expp 
                    INNER JOIN expenses as exp ON expp.expense_id = exp.id 
                    INNER JOIN expense_categories as cat ON exp.category_id = cat.id 
                    INNER JOIN users as u ON expp.created_by = u.id 
                    WHERE u.clinic_id = ? 
                        AND DATE(expp.created_at) >= ? 
                        AND DATE(expp.created_at) <= ?
                    GROUP BY exp.category_id, cat.name
                    ORDER BY amount DESC
                ', [$clinic_id, $start_date, $end_date]);
            } else {
                $data['statistics']['expenses_by_category'] = DB::select('
                    SELECT exp.category_id, cat.name, SUM(expp.amount) as amount 
                    FROM expense_payments as expp 
                    INNER JOIN expenses as exp ON expp.expense_id = exp.id 
                    INNER JOIN expense_categories as cat ON exp.category_id = cat.id 
                    WHERE DATE(expp.created_at) >= ? 
                        AND DATE(expp.created_at) <= ?
                    GROUP BY exp.category_id, cat.name
                    ORDER BY amount DESC
                ', [$start_date, $end_date]);
            }
            
            // Map to expected format
            $data['statistics']['expenses_by_category'] = array_map(function($item) {
                return [
                    'name' => $item->name,
                    'total_amount' => (float) ($item->amount ?? 0),
                ];
            }, $data['statistics']['expenses_by_category']);
            
            // Also set top_expense_categories for compatibility
            $data['statistics']['top_expense_categories'] = $data['statistics']['expenses_by_category'];
        } catch (\Exception $e) {
            \Log::error('Error calculating expenses by category', ['error' => $e->getMessage()]);
            $data['statistics']['expenses_by_category'] = [];
            $data['statistics']['top_expense_categories'] = [];
        }

        // Get payment trends (last 7 days)
        try {
            $paymentQuery = DB::table('patient_item_payments')
                ->join('users', 'patient_item_payments.created_by', '=', 'users.id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', Carbon::now()->subDays(7)->format('Y-m-d') . ' 00:00:00')
                ->where('patient_item_payments.amount', '>', 0);
            
            if ($clinic_id) {
                $paymentQuery->where('users.clinic_id', $clinic_id);
            }
            
            $data['statistics']['payment_trends'] = $paymentQuery
                ->select(
                    DB::raw('DATE(patient_item_payments.created_at) as date'),
                    DB::raw('COALESCE(SUM(patient_item_payments.amount), 0) as revenue')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        } catch (\Exception $e) {
            \Log::error('Error calculating payment trends', ['error' => $e->getMessage()]);
            $data['statistics']['payment_trends'] = [];
        }

        // Get expense trends (last 7 days) - using expense_payments for consistency
        try {
            $expenseQuery = DB::table('expense_payments')
                ->join('users', 'expense_payments.created_by', '=', 'users.id')
                ->whereNotNull('expense_payments.created_at')
                ->where('expense_payments.created_at', '>=', Carbon::now()->subDays(7)->format('Y-m-d') . ' 00:00:00')
                ->where('expense_payments.amount', '>', 0);
            
            if ($clinic_id) {
                $expenseQuery->where('users.clinic_id', $clinic_id);
            }
            
            $data['statistics']['expense_trends'] = $expenseQuery
                ->select(
                    DB::raw('DATE(expense_payments.created_at) as date'),
                    DB::raw('COALESCE(SUM(expense_payments.amount), 0) as expenses')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        } catch (\Exception $e) {
            \Log::error('Error calculating expense trends', ['error' => $e->getMessage()]);
            $data['statistics']['expense_trends'] = [];
        }

        // Get payments by channel (for director dashboard)
        try {
            if ($clinic_id) {
                $data['statistics']['payments_by_channel'] = DB::select('
                    SELECT channel_id, name, SUM(amount) as amount 
                    FROM (
                        (SELECT pmt.channel_id, pc.name, SUM(pmt.amount - COALESCE(pmt.discount, 0)) as amount 
                         FROM patient_item_payments as pmt 
                         INNER JOIN payment_channels as pc ON pmt.channel_id = pc.id 
                         INNER JOIN users as u ON pmt.created_by = u.id 
                         WHERE u.clinic_id = ? 
                             AND DATE(pmt.created_at) >= ? 
                             AND DATE(pmt.created_at) <= ?
                         GROUP BY pmt.channel_id, pc.name)
                        UNION
                        (SELECT pmt.channel_id, pc.name, SUM(pmt.amount) as amount 
                         FROM patient_item_bill_payments as pmt 
                         INNER JOIN payment_channels as pc ON pmt.channel_id = pc.id 
                         INNER JOIN users as u ON pmt.created_by = u.id 
                         WHERE u.clinic_id = ? 
                             AND DATE(pmt.created_at) >= ? 
                             AND DATE(pmt.created_at) <= ?
                         GROUP BY pmt.channel_id, pc.name)
                    ) as payments 
                    GROUP BY channel_id, name
                    ORDER BY amount DESC
                ', [$clinic_id, $start_date, $end_date, $clinic_id, $start_date, $end_date]);
            } else {
                $data['statistics']['payments_by_channel'] = DB::select('
                    SELECT channel_id, name, SUM(amount) as amount 
                    FROM (
                        (SELECT pmt.channel_id, pc.name, SUM(pmt.amount - COALESCE(pmt.discount, 0)) as amount 
                         FROM patient_item_payments as pmt 
                         INNER JOIN payment_channels as pc ON pmt.channel_id = pc.id 
                         WHERE DATE(pmt.created_at) >= ? 
                             AND DATE(pmt.created_at) <= ?
                         GROUP BY pmt.channel_id, pc.name)
                        UNION
                        (SELECT pmt.channel_id, pc.name, SUM(pmt.amount) as amount 
                         FROM patient_item_bill_payments as pmt 
                         INNER JOIN payment_channels as pc ON pmt.channel_id = pc.id 
                         WHERE DATE(pmt.created_at) >= ? 
                             AND DATE(pmt.created_at) <= ?
                         GROUP BY pmt.channel_id, pc.name)
                    ) as payments 
                    GROUP BY channel_id, name
                    ORDER BY amount DESC
                ', [$start_date, $end_date, $start_date, $end_date]);
            }
            
            // Map to expected format
            $data['statistics']['payments_by_channel'] = array_map(function($item) {
                return [
                    'name' => $item->name,
                    'amount' => (float) ($item->amount ?? 0),
                ];
            }, $data['statistics']['payments_by_channel']);
        } catch (\Exception $e) {
            \Log::error('Error calculating payments by channel', ['error' => $e->getMessage()]);
            $data['statistics']['payments_by_channel'] = [];
        }

        // Get consultations by item (for director dashboard)
        try {
            if ($clinic_id) {
                $data['statistics']['consultations_by_item'] = DB::select('
                    SELECT it.id, it.name, COUNT(ct.id) as consultations 
                    FROM items as it 
                    INNER JOIN patient_payment_cache_items as ppci ON ppci.item_id = it.id 
                    INNER JOIN consultations as ct ON ct.payment_cache_item_id = ppci.id 
                    INNER JOIN users as u ON ct.created_by = u.id 
                    WHERE u.clinic_id = ? 
                        AND ppci.status = ? 
                        AND DATE(ppci.served_at) >= ? 
                        AND DATE(ppci.served_at) <= ?
                        AND ct.patient_direction = ? 
                        AND ct.status = ? 
                    GROUP BY it.id, it.name
                    ORDER BY consultations DESC
                ', [$clinic_id, 'Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
            } else {
                $data['statistics']['consultations_by_item'] = DB::select('
                    SELECT it.id, it.name, COUNT(ct.id) as consultations 
                    FROM items as it 
                    INNER JOIN patient_payment_cache_items as ppci ON ppci.item_id = it.id 
                    INNER JOIN consultations as ct ON ct.payment_cache_item_id = ppci.id 
                    WHERE ppci.status = ? 
                        AND DATE(ppci.served_at) >= ? 
                        AND DATE(ppci.served_at) <= ?
                        AND ct.patient_direction = ? 
                        AND ct.status = ? 
                    GROUP BY it.id, it.name
                    ORDER BY consultations DESC
                ', ['Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
            }
            
            // Map to expected format
            $data['statistics']['consultations_by_item'] = array_map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'consultations' => (int) ($item->consultations ?? 0),
                ];
            }, $data['statistics']['consultations_by_item']);
        } catch (\Exception $e) {
            \Log::error('Error calculating consultations by item', ['error' => $e->getMessage()]);
            $data['statistics']['consultations_by_item'] = [];
        }

        // Get client statistics (new vs returning clients)
        try {
            // Total patients registered
            $totalPatientsQuery = Patient::query();
            if ($clinic_id) {
                $totalPatientsQuery->whereHas('check_ins.creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            $totalPatients = $totalPatientsQuery->count();
            
            // New patients (first check-in in date range)
            $newPatientsQuery = PatientCheckIn::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $newPatientsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $patientsWithCheckIns = $newPatientsQuery->pluck('patient_id')->unique();
            $newPatients = 0;
            $returnPatients = 0;
            
            foreach ($patientsWithCheckIns as $patientId) {
                $previousCheckIns = PatientCheckIn::query()
                    ->where('patient_id', $patientId)
                    ->where('created_at', '<', $start_date . ' 00:00:00');
                
                if ($clinic_id) {
                    $previousCheckIns->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                }
                
                if ($previousCheckIns->count() > 0) {
                    $returnPatients++;
                } else {
                    $newPatients++;
                }
            }
            
            $data['statistics']['client_statistics'] = [
                ['name' => 'New Client', 'count' => $newPatients],
                ['name' => 'Returning Client', 'count' => $returnPatients],
                ['name' => 'Total Clients', 'count' => $totalPatients],
            ];
        } catch (\Exception $e) {
            \Log::error('Error calculating client statistics', ['error' => $e->getMessage()]);
            $data['statistics']['client_statistics'] = [];
        }

        // Get sales_expenses (for period-based charts)
        $salesExpensesPeriod = is_string($request->sales_expenses_period ?? 'yearly')
            ? $request->sales_expenses_period
            : 'yearly';
        if (!in_array($salesExpensesPeriod, ['daily', 'monthly', 'yearly'], true)) {
            $salesExpensesPeriod = 'yearly';
        }
        try {
            $data['statistics']['sales_expenses'] = $this->generateSalesExpensesData($clinic_id, $salesExpensesPeriod);
        } catch (\Exception $e) {
            \Log::error('Error generating sales_expenses data', ['error' => $e->getMessage()]);
            $data['statistics']['sales_expenses'] = [];
        }

        // Get patient_registration (for period-based charts)
        $patientRegistrationPeriod = is_string($request->patient_registration_period ?? 'yearly')
            ? $request->patient_registration_period
            : 'yearly';
        if (!in_array($patientRegistrationPeriod, ['daily', 'monthly', 'yearly'], true)) {
            $patientRegistrationPeriod = 'yearly';
        }
        try {
            $data['statistics']['patient_registration'] = $this->generatePatientRegistrationData($clinic_id, $patientRegistrationPeriod);
        } catch (\Exception $e) {
            \Log::error('Error generating patient_registration data', ['error' => $e->getMessage()]);
            $data['statistics']['patient_registration'] = [];
        }

        // Add summary fields needed by director dashboard
        $data['summary']['consultation'] = 0;
        $data['summary']['pharmacy'] = 0;
        $data['summary']['glass'] = 0;
        $data['summary']['others'] = 0;
        $data['summary']['discount'] = 0;
        $data['summary']['consulted_patients'] = 0;

        // Calculate consultation, pharmacy, glass, others from payment cache items
        try {
            if ($clinic_id) {
                // Consultation fees are stored under consultation_type 'Others' (ID 4)
                $consultationQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Others');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                
                $data['summary']['consultation'] = $consultationQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                $pharmacyQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Pharmacy');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                
                $data['summary']['pharmacy'] = $pharmacyQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                $glassQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                
                $data['summary']['glass'] = $glassQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                // Procedures are the 'others' category (consultation_type 'Procedure', ID 3)
                $othersQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Procedure');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                
                $data['summary']['others'] = $othersQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
            } else {
                // Consultation fees are stored under consultation_type 'Others' (ID 4)
                $consultationQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Others');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59');
                
                $data['summary']['consultation'] = $consultationQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                $pharmacyQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Pharmacy');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59');
                
                $data['summary']['pharmacy'] = $pharmacyQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                $glassQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59');
                
                $data['summary']['glass'] = $glassQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
                
                // Procedures are the 'others' category (consultation_type 'Procedure', ID 3)
                $othersQuery = PatientPaymentCacheItem::query()
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Procedure');
                    })
                    ->whereIn('status', ['Paid', 'Billed', 'Served'])
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59');
                
                $data['summary']['others'] = $othersQuery->sum(DB::raw('unit_price * quantity')) ?? 0;
            }
        } catch (\Exception $e) {
            \Log::error('Error calculating category sales', ['error' => $e->getMessage()]);
        }

        // Debug logging
        \Log::info('FinancialManagementDashboard data', [
            'clinic_id' => $clinic_id,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'total_revenue' => $data['summary']['total_revenue'],
            'total_expenses' => $data['summary']['total_expenses'],
            'net_profit' => $data['summary']['net_profit'],
            'payment_trends_count' => count($data['statistics']['payment_trends']),
            'expense_trends_count' => count($data['statistics']['expense_trends']),
            'payments_by_channel_count' => count($data['statistics']['payments_by_channel']),
            'expenses_by_category_count' => count($data['statistics']['expenses_by_category']),
            'consultations_by_item_count' => count($data['statistics']['consultations_by_item']),
            'client_statistics_count' => count($data['statistics']['client_statistics']),
        ]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Financial Management Dashboard data retrieved successfully.');
    }

    private function generateSalesExpensesData($clinic_id, $period)
    {
        try {
            $data = [];
            $today = Carbon::today();

            if ($period === 'daily') {
                // Last 30 days
                for ($i = 29; $i >= 0; $i--) {
                    $date = $today->copy()->subDays($i);
                    $dateStr = $date->format('Y-m-d');

                    $salesQuery = PatientItemPayment::query()
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $dateStr)
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $salesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $sales = $salesQuery->sum(DB::raw('COALESCE(amount, 0) - COALESCE(discount, 0)')) ?? 0;
                    
                    $billSalesQuery = PatientItemBillPayment::query()
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $dateStr)
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $billSalesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $billSales = $billSalesQuery->sum('amount') ?? 0;
                    $totalSales = $sales + $billSales;

                    $expensesQuery = ExpensePayment::query()
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $dateStr)
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $expenses = $expensesQuery->sum('amount') ?? 0;

                    $data[] = [
                        'period' => $date->format('M d'),
                        'sales' => $totalSales,
                        'expenses' => $expenses,
                    ];
                }
            } elseif ($period === 'monthly') {
                // Last 12 months
                $date = $today->copy()->subMonths(11);
                for ($i = 0; $i < 12; $i++) {
                    $month_start = $date->copy()->startOfMonth()->format('Y-m-d');
                    $month_end = $date->copy()->endOfMonth()->format('Y-m-d');

                    $salesQuery = PatientItemPayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $month_start . ' 00:00:00')
                        ->where('created_at', '<=', $month_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $salesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $sales = $salesQuery->sum(DB::raw('COALESCE(amount, 0) - COALESCE(discount, 0)')) ?? 0;
                    
                    $billSalesQuery = PatientItemBillPayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $month_start . ' 00:00:00')
                        ->where('created_at', '<=', $month_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $billSalesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $billSales = $billSalesQuery->sum('amount') ?? 0;
                    $totalSales = $sales + $billSales;

                    $expensesQuery = ExpensePayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $month_start . ' 00:00:00')
                        ->where('created_at', '<=', $month_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $expenses = $expensesQuery->sum('amount') ?? 0;

                    $data[] = [
                        'period' => $date->format('M Y'),
                        'sales' => $totalSales,
                        'expenses' => $expenses,
                    ];

                    $date->addMonthNoOverflow();
                }
            } else { // yearly
                // Last 5 years
                $date = $today->copy()->subYears(4);
                for ($i = 0; $i < 5; $i++) {
                    $year_start = $date->copy()->startOfYear()->format('Y-m-d');
                    $year_end = $date->copy()->endOfYear()->format('Y-m-d');

                    $salesQuery = PatientItemPayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $year_start . ' 00:00:00')
                        ->where('created_at', '<=', $year_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $salesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $sales = $salesQuery->sum(DB::raw('COALESCE(amount, 0) - COALESCE(discount, 0)')) ?? 0;
                    
                    $billSalesQuery = PatientItemBillPayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $year_start . ' 00:00:00')
                        ->where('created_at', '<=', $year_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $billSalesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $billSales = $billSalesQuery->sum('amount') ?? 0;
                    $totalSales = $sales + $billSales;

                    $expensesQuery = ExpensePayment::query()
                        ->whereNotNull('created_at')
                        ->where('created_at', '>=', $year_start . ' 00:00:00')
                        ->where('created_at', '<=', $year_end . ' 23:59:59')
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $expenses = $expensesQuery->sum('amount') ?? 0;

                    $data[] = [
                        'period' => $date->format('Y'),
                        'sales' => $totalSales,
                        'expenses' => $expenses,
                    ];

                    $date->addYear();
                }
            }

            return $data;
        } catch (\Exception $e) {
            \Log::error('generateSalesExpensesData error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'period' => $period,
            ]);
            return [];
        }
    }

    private function generatePatientRegistrationData($clinic_id, $period)
    {
        try {
            $data = [];
            $today = Carbon::today();

            if ($period === 'daily') {
                // Last 30 days
                for ($i = 29; $i >= 0; $i--) {
                    $date = $today->copy()->subDays($i);
                    $dateStr = $date->format('Y-m-d');

                    $maleQuery = Patient::query()
                        ->where('gender', 'Male')
                        ->whereDate('created_at', $dateStr);
                    
                    if ($clinic_id) {
                        $maleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $male = $maleQuery->count();

                    $femaleQuery = Patient::query()
                        ->where('gender', 'Female')
                        ->whereDate('created_at', $dateStr);
                    
                    if ($clinic_id) {
                        $femaleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $female = $femaleQuery->count();

                    $data[] = [
                        'period' => $date->format('M d'),
                        'male' => $male,
                        'female' => $female,
                    ];
                }
            } elseif ($period === 'monthly') {
                // Last 12 months
                $date = $today->copy()->subMonths(11);
                for ($i = 0; $i < 12; $i++) {
                    $month_start = $date->copy()->startOfMonth()->format('Y-m-d');
                    $month_end = $date->copy()->endOfMonth()->format('Y-m-d');

                    $maleQuery = Patient::query()
                        ->where('gender', 'Male')
                        ->where('created_at', '>=', $month_start . ' 00:00:00')
                        ->where('created_at', '<=', $month_end . ' 23:59:59');
                    
                    if ($clinic_id) {
                        $maleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $male = $maleQuery->count();

                    $femaleQuery = Patient::query()
                        ->where('gender', 'Female')
                        ->where('created_at', '>=', $month_start . ' 00:00:00')
                        ->where('created_at', '<=', $month_end . ' 23:59:59');
                    
                    if ($clinic_id) {
                        $femaleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $female = $femaleQuery->count();

                    $data[] = [
                        'period' => $date->format('M Y'),
                        'male' => $male,
                        'female' => $female,
                    ];

                    $date->addMonthNoOverflow();
                }
            } else { // yearly
                // Last 5 years
                $date = $today->copy()->subYears(4);
                for ($i = 0; $i < 5; $i++) {
                    $year_start = $date->copy()->startOfYear()->format('Y-m-d');
                    $year_end = $date->copy()->endOfYear()->format('Y-m-d');

                    $maleQuery = Patient::query()
                        ->where('gender', 'Male')
                        ->where('created_at', '>=', $year_start . ' 00:00:00')
                        ->where('created_at', '<=', $year_end . ' 23:59:59');
                    
                    if ($clinic_id) {
                        $maleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $male = $maleQuery->count();

                    $femaleQuery = Patient::query()
                        ->where('gender', 'Female')
                        ->where('created_at', '>=', $year_start . ' 00:00:00')
                        ->where('created_at', '<=', $year_end . ' 23:59:59');
                    
                    if ($clinic_id) {
                        $femaleQuery->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $female = $femaleQuery->count();

                    $data[] = [
                        'period' => $date->format('Y'),
                        'male' => $male,
                        'female' => $female,
                    ];

                    $date->addYear();
                }
            }

            return $data;
        } catch (\Exception $e) {
            \Log::error('generatePatientRegistrationData error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'period' => $period,
            ]);
            return [];
        }
    }
}
