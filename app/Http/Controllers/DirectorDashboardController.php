<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\ExpensePayment;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DirectorDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        
        // Default to today if no dates provided
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Today's Patients count (Active check-ins in date range)
        $data['summary']['today_patients'] = \App\Models\PatientCheckIn::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->distinct('patient_id')
            ->count('patient_id');

        // Total Patients Registered in date range
        $data['summary']['total_patients_registered'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('check_ins', function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Web Appointment Bookings in date range
        $data['summary']['web_appointment_bookings'] = Appointment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('repliedBy', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Total Revenue (actual payments linked to cache items, no orphans)
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
            $itemPayments = (float) ($revenueQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);
            
            // Add actual bill payments (not bill face values)
            $billPaymentsQuery = PatientItemBillPayment::query()
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
                $billPaymentsQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $billPayments = (float) $billPaymentsQuery->sum('patient_item_bill_payments.amount');
            
            $data['summary']['total_sales'] = $itemPayments + $billPayments;
        } catch (\Exception $e) {
            \Log::error('Error calculating total sales', ['error' => $e->getMessage()]);
            $data['summary']['total_sales'] = 0;
        }

        // Total Expenses
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
            
            $data['summary']['total_expenses'] = (float) ($expensesQuery->sum('amount') ?? 0);
        } catch (\Exception $e) {
            \Log::error('Error calculating total expenses', ['error' => $e->getMessage()]);
            $data['summary']['total_expenses'] = 0;
        }

        // Note: total_purchases will be calculated later as sum of all COGS categories
        $data['summary']['total_purchases'] = 0;

        // Net Profit (will be recalculated later after COGS)
        $data['summary']['net_profit'] = $data['summary']['total_sales'] - $data['summary']['total_expenses'];

        // Alias total_revenue for Financial Management compatibility
        $data['summary']['total_revenue'] = $data['summary']['total_sales'];

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

        // Running Cost & Improvement Cost (by explicit flag OR category match)
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
        } catch (\Exception $e) {
            \Log::error('Error calculating running/improvement costs', ['error' => $e->getMessage()]);
            $data['summary']['running_cost'] = 0;
            $data['summary']['improvement_cost'] = 0;
        }

        // New Metrics: Total Patients Seen & Waiting
        try {
            // Total patients seen (Consulted) in date range
            $data['summary']['total_patients_seen'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->distinct()
                ->count('payment_cache_item_id');

            // Total patients waiting
            $waitingQuery = \App\Models\PatientWaitingTime::query()
                ->whereIn('status', ['waiting', 'in_treatment'])
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('patient.check_ins', function ($q) use ($clinic_id) {
                        $q->whereHas('payment_cache.items.creator', function ($userQuery) use ($clinic_id) {
                            $userQuery->where('clinic_id', $clinic_id);
                        });
                    });
                });
            $data['summary']['total_patients_waiting'] = $waitingQuery->count();
        } catch (\Exception $e) {
            \Log::error('Error calculating seen/waiting patients', ['error' => $e->getMessage()]);
            $data['summary']['total_patients_seen'] = 0;
            $data['summary']['total_patients_waiting'] = 0;
        }

        // Expense payments total (alias for Financial Management compatibility)
        $data['summary']['expense_payments'] = $data['summary']['total_expenses'];

        // Revenue from New Consultation - using exact same logic as main Dashboard
        try {
            // Use the exact same logic as main DashboardController getDailyCashCollectionData
            $item_payments = DB::table('patient_item_payments as pmt')
                ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
                ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->where('pmt.amount', '>', 0);
            
            if ($clinic_id) {
                $item_payments->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $bill_payments = DB::table('patient_item_bill_payments as pmt')
                ->join('patient_item_bills as pib', 'pmt.bill_id', '=', 'pib.id')
                ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pmt.bill_id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
                ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->where('pmt.amount', '>', 0);
            
            if ($clinic_id) {
                $bill_payments->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Calculate consultation revenue by item name - exact same logic as main dashboard
            $consultation_new_total = 0;
            $consultation_return_total = 0;
            
            // Process item payments
            $item_categories = $item_payments
                ->selectRaw('it.category, it.name, SUM(pmt.amount - COALESCE(pmt.discount, 0)) as total_amount, COUNT(DISTINCT pt.id) as patient_count')
                ->groupBy('it.category', 'it.name')
                ->get();
            
            foreach ($item_categories as $item) {
                $name = $item->name;
                $amount = $item->total_amount;
                
                if ($name === 'General Consultation - New') {
                    $consultation_new_total += $amount;
                } elseif ($name === 'General Consultation - Return' || $name === 'General Consultation - Verify') {
                    $consultation_return_total += $amount;
                }
            }
            
            // Process bill payments
            $bill_categories = $bill_payments
                ->selectRaw('it.category, it.name, SUM(pmt.amount) as total_amount, COUNT(DISTINCT pt.id) as patient_count')
                ->groupBy('it.category', 'it.name')
                ->get();
            
            foreach ($bill_categories as $item) {
                $name = $item->name;
                $amount = $item->total_amount;
                
                if ($name === 'General Consultation - New') {
                    $consultation_new_total += $amount;
                } elseif ($name === 'General Consultation - Return' || $name === 'General Consultation - Verify') {
                    $consultation_return_total += $amount;
                }
            }
            
            $data['summary']['revenue_new_consultation'] = $consultation_new_total;
            $data['summary']['revenue_return_consultation'] = $consultation_return_total;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from consultations', ['error' => $e->getMessage()]);
            $data['summary']['revenue_new_consultation'] = 0;
            $data['summary']['revenue_return_consultation'] = 0;
        }

        // Total Revenue from All Consultations
        $data['summary']['revenue_all_consultations'] =
            ($data['summary']['revenue_new_consultation'] ?? 0)
            + ($data['summary']['revenue_return_consultation'] ?? 0);

        // Optical Sales = Glass + Frames (from Daily Cash Collection)
        try {
            $opticalCash = (float) DB::table('patient_item_payments as pmt')
                ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->whereNotIn(DB::raw('LOWER(ct.name)'), ['pharmacy', 'procedure'])
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereIn('pmt.created_by', function($s) use ($clinic_id) {
                        $s->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->sum(DB::raw('pmt.amount - COALESCE(pmt.discount, 0)'));

            $opticalBill = (float) DB::table('patient_item_bill_payments as pmt')
                ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pmt.bill_id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->whereNotIn(DB::raw('LOWER(ct.name)'), ['pharmacy', 'procedure'])
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereIn('pmt.created_by', function($s) use ($clinic_id) {
                        $s->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->sum('pmt.amount');

            $data['summary']['optical_sales'] = $opticalCash + $opticalBill;
        } catch (\Exception $e) {
            \Log::error('Error calculating optical sales', ['error' => $e->getMessage()]);
            $data['summary']['optical_sales'] = 0;
        }

        // Pending Bills - from Cashier Patient Pending Bills queue (filtered by date range)
        try {
            $pendingBillsQuery = DB::table('patient_item_bills')
                ->where('status', 'Pending')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            if ($clinic_id) {
                $pendingBillsQuery->whereIn('created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            $data['summary']['pending_bills'] = (float) $pendingBillsQuery->sum('amount');
        } catch (\Exception $e) {
            \Log::error('Error calculating pending bills', ['error' => $e->getMessage()]);
            $data['summary']['pending_bills'] = 0;
        }

        // Lens Sales (from Daily Cash Collection)
        try {
            $lensCash = (float) DB::table('patient_item_payments as pmt')
                ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('item_types as itype', 'it.item_type_id', '=', 'itype.id')
                ->where('itype.name', 'Lens')
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereIn('pmt.created_by', function($s) use ($clinic_id) {
                        $s->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->sum(DB::raw('pmt.amount - COALESCE(pmt.discount, 0)'));
            $data['summary']['lens'] = $lensCash;
        } catch (\Exception $e) {
            \Log::error('Error calculating lens sales', ['error' => $e->getMessage()]);
            $data['summary']['lens'] = 0;
        }

        // Frame Sales (from Daily Cash Collection)
        try {
            $frameCash = (float) DB::table('patient_item_payments as pmt')
                ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('item_types as itype', 'it.item_type_id', '=', 'itype.id')
                ->where('itype.name', 'Frame')
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereIn('pmt.created_by', function($s) use ($clinic_id) {
                        $s->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->sum(DB::raw('pmt.amount - COALESCE(pmt.discount, 0)'));
            $data['summary']['frame'] = $frameCash;
        } catch (\Exception $e) {
            \Log::error('Error calculating frame sales', ['error' => $e->getMessage()]);
            $data['summary']['frame'] = 0;
        }

        // Total Discount - from Daily Cash Collection (payment queue)
        try {
            $discountQuery = DB::table('patient_item_payments')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('discount', '>', 0);
            if ($clinic_id) {
                $discountQuery->whereIn('created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            $data['summary']['discount'] = (float) $discountQuery->sum('discount');
        } catch (\Exception $e) {
            \Log::error('Error calculating total discount', ['error' => $e->getMessage()]);
            $data['summary']['discount'] = 0;
        }

        // Consultation Revenue (consultation_type 'Others') - proportional from actual payments
        try {
            // Cash payments - proportional allocation
            $consultationCash = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->where('ppci.consultation_type_id', function ($q) {
                    $q->select('id')->from('consultation_types')->where('name', 'Others')->limit(1);
                })
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            // Bill payments - proportional allocation
            $consultationBill = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                
                ->where('ppci.consultation_type_id', function ($q) {
                    $q->select('id')->from('consultation_types')->where('name', 'Others')->limit(1);
                })
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            $data['summary']['consultation'] = $consultationCash + $consultationBill;
            
            // Consultation Purchases (COGS) - status-based for cost tracking
            $consultationPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('ppci.consultation_type_id', function ($q) {
                    $q->select('id')->from('consultation_types')->where('name', 'Others')->limit(1);
                });
            
            if ($clinic_id) {
                $consultationPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['consultation_purchases'] = $consultationPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['consultation_profit'] = $data['summary']['consultation'] - $data['summary']['consultation_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating consultation sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['consultation'] = 0;
            $data['summary']['consultation_purchases'] = 0;
            $data['summary']['consultation_profit'] = 0;
        }

        // Pharmacy Sales - proportional from actual payments
        try {
            // Cash payments
            $pharmacyCash = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->whereRaw('LOWER(ct.name) = ?', ['pharmacy'])
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            // Bill payments
            $pharmacyBill = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                
                ->whereRaw('LOWER(ct.name) = ?', ['pharmacy'])
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            $data['summary']['pharmacy'] = $pharmacyCash + $pharmacyBill;
            
            // Pharmacy Purchases (COGS)
            $pharmacyPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereRaw('LOWER(ct.name) = ?', ['pharmacy']);
            
            if ($clinic_id) {
                $pharmacyPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['pharmacy_purchases'] = $pharmacyPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['pharmacy_profit'] = $data['summary']['pharmacy'] - $data['summary']['pharmacy_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating pharmacy sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['pharmacy'] = 0;
            $data['summary']['pharmacy_purchases'] = 0;
            $data['summary']['pharmacy_profit'] = 0;
        }

        // Glass Sales - proportional from actual payments (excludes frames)
        try {
            // Cash payments
            $glassCash = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->whereNotIn(DB::raw('LOWER(ct.name)'), ['pharmacy', 'procedure'])
                ->where('it.item_type_id', '!=', 4)
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            // Bill payments
            $glassBill = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                
                ->whereNotIn(DB::raw('LOWER(ct.name)'), ['pharmacy', 'procedure'])
                ->where('it.item_type_id', '!=', 4)
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            $data['summary']['glass'] = $glassCash + $glassBill;
            
            // Glass Purchases (COGS)
            $glassPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereNotIn(DB::raw('LOWER(ct.name)'), ['pharmacy', 'procedure'])
                ->where('it.item_type_id', '!=', 4);
            
            if ($clinic_id) {
                $glassPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['glass_purchases'] = $glassPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['glass_profit'] = $data['summary']['glass'] - $data['summary']['glass_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating glass sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['glass'] = 0;
            $data['summary']['glass_purchases'] = 0;
            $data['summary']['glass_profit'] = 0;
        }

        // Frame Sales - proportional from actual payments (item_type_id = 4)
        try {
            // Cash payments
            $frameCash = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->where('it.item_type_id', 4)
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            // Bill payments
            $frameBill = (float) (DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                
                ->where('it.item_type_id', 4)
                ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                        $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                    });
                })
                ->selectRaw('SUM(ppci.unit_price * ppci.quantity) as net')
                ->first()->net ?? 0);

            $data['summary']['frame'] = $frameCash + $frameBill;
            
            // Frame Purchases (COGS)
            $framePurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('it.item_type_id', 4);
            
            if ($clinic_id) {
                $framePurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['frame_purchases'] = $framePurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['frame_profit'] = $data['summary']['frame'] - $data['summary']['frame_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating frame sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['frame'] = 0;
            $data['summary']['frame_purchases'] = 0;
            $data['summary']['frame_profit'] = 0;
        }

        // Calculate Total Purchases as sum of all COGS categories (for display only)
        $data['summary']['total_purchases'] = 
            ($data['summary']['consultation_purchases'] ?? 0) +
            ($data['summary']['pharmacy_purchases'] ?? 0) +
            ($data['summary']['glass_purchases'] ?? 0) +
            ($data['summary']['frame_purchases'] ?? 0);

        // Net Profit = Revenue - Expenses (simple formula matching Financial Management)
        // Note: COGS is tracked separately for reporting but not deducted from net profit

        // Consulted Patients (patients who have been consulted)
        try {
            $data['summary']['consulted_patients'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error calculating consulted patients', ['error' => $e->getMessage()]);
            $data['summary']['consulted_patients'] = 0;
        }

        // Consultation Room Department Metrics (matching ConsultationRoomDashboardController)
        try {
            // Total consultations in date range
            $data['summary']['total_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Consultations today
            $data['summary']['consultations_today'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', Carbon::today()->format('Y-m-d'))
                ->count();

            // Pending consultations
            $data['summary']['pending_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Pending')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Completed consultations
            $data['summary']['completed_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Total patients consulted (distinct patients) - today only
            $data['summary']['total_patients_consulted'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', Carbon::today()->format('Y-m-d'))
                ->distinct()
                ->count('payment_cache_item_id');

        } catch (\Exception $e) {
            \Log::error('Error calculating consultation room metrics', ['error' => $e->getMessage()]);
            $data['summary']['total_consultations'] = 0;
            $data['summary']['consultations_today'] = 0;
            $data['summary']['pending_consultations'] = 0;
            $data['summary']['completed_consultations'] = 0;
            $data['summary']['total_patients_consulted'] = 0;
        }

        // Department/clinical support metrics (matching DashboardController)
        try {
            // Laboratory statistics
            $data['summary']['lab_requests'] = \App\Models\LabRequest::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            $data['summary']['lab_results'] = \App\Models\LabRequest::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Completed')
                ->whereDate('updated_at', '>=', $start_date)
                ->whereDate('updated_at', '<=', $end_date)
                ->count();

            // Radiology statistics
            $data['summary']['radiology_requests'] = \App\Models\RadiologyRequest::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Blood bank statistics
            $data['summary']['blood_donations'] = \App\Models\BloodDonor::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            $data['summary']['blood_units'] = \App\Models\BloodBankUnit::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Available')
                ->count();

            // E-Prescription statistics
            $data['summary']['prescriptions'] = \App\Models\Prescription::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Wards/Inpatient statistics
            $data['summary']['admissions'] = \App\Models\Admission::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            $data['summary']['active_admissions'] = \App\Models\Admission::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Admitted')
                ->count();

            // Operating theatre statistics
            $data['summary']['surgeries'] = \App\Models\Surgery::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Mortuary statistics (status used by the Mortuary module)
            $data['summary']['mortuary_bodies'] = \App\Models\MortuaryBody::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'In-Storage')
                ->count();

            // Inpatient billing statistics
            $data['summary']['inpatient_bills'] = \App\Models\InpatientBill::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Emergency statistics
            $data['summary']['er_visits'] = \App\Models\ErVisit::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Ambulance statistics
            $data['summary']['ambulance_requests'] = \App\Models\AmbulanceRequest::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            $data['summary']['ambulance_trips'] = \App\Models\AmbulanceTrip::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error calculating department/clinical metrics', ['error' => $e->getMessage()]);
            $data['summary']['lab_requests'] = 0;
            $data['summary']['lab_results'] = 0;
            $data['summary']['radiology_requests'] = 0;
            $data['summary']['blood_donations'] = 0;
            $data['summary']['blood_units'] = 0;
            $data['summary']['prescriptions'] = 0;
            $data['summary']['admissions'] = 0;
            $data['summary']['active_admissions'] = 0;
            $data['summary']['surgeries'] = 0;
            $data['summary']['mortuary_bodies'] = 0;
            $data['summary']['inpatient_bills'] = 0;
            $data['summary']['er_visits'] = 0;
            $data['summary']['ambulance_requests'] = 0;
            $data['summary']['ambulance_trips'] = 0;
        }

        // Total Transactions
        $data['summary']['total_transactions'] = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count() + PatientItemBillPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Sales by Product Category (Item Types) - Calculate from actual payments with proportional net amounts
        try {
        if ($clinic_id) {
            $data['statistics']['sales_by_category'] = DB::select("
                SELECT 
                    category_name as name,
                    SUM(net_amount) as total_sales,
                    COUNT(*) as transaction_count
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                        AND pip.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                        AND pibp.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                ) as combined
                GROUP BY category_name
                ORDER BY total_sales DESC
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id, $start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id]);
        } else {
            $data['statistics']['sales_by_category'] = DB::select("
                SELECT 
                    category_name as name,
                    SUM(net_amount) as total_sales,
                    COUNT(*) as transaction_count
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                ) as combined
                GROUP BY category_name
                ORDER BY total_sales DESC
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);
        }
        } catch (\Exception $e) {
            \Log::error('Error calculating sales_by_category', ['error' => $e->getMessage()]);
            $data['statistics']['sales_by_category'] = [];
        }

        // Top Selling Items - Calculate from actual payments with proportional net amounts
        try {
        if ($clinic_id) {
            $data['statistics']['top_selling_items'] = DB::select("
                SELECT 
                    item_id as id,
                    item_name as name,
                    category_name,
                    SUM(net_amount) as total_sales,
                    SUM(qty) as total_quantity
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                        AND pip.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                        AND pibp.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                ) as combined
                GROUP BY item_id, item_name, category_name
                ORDER BY total_sales DESC
                LIMIT 10
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id, $start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id]);
        } else {
            $data['statistics']['top_selling_items'] = DB::select("
                SELECT 
                    item_id as id,
                    item_name as name,
                    category_name,
                    SUM(net_amount) as total_sales,
                    SUM(qty) as total_quantity
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        ppci.unit_price * ppci.quantity as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                ) as combined
                GROUP BY item_id, item_name, category_name
                ORDER BY total_sales DESC
                LIMIT 10
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);
        }
        } catch (\Exception $e) {
            \Log::error('Error calculating top_selling_items', ['error' => $e->getMessage()]);
            $data['statistics']['top_selling_items'] = [];
        }

        // Get SMS balance from MACKSMS API
        try {
            $mackSmsService = new \App\Http\Services\MackSmsService();
            $smsBalanceResult = $mackSmsService->getBalance();
            
            if ($smsBalanceResult && isset($smsBalanceResult['success']) && $smsBalanceResult['success'] === true) {
                $data['summary']['sms_balance'] = $smsBalanceResult['sms_balance'] ?? 0;
            } else {
                $data['summary']['sms_balance'] = 0;
            }
        } catch (\Exception $e) {
            \Log::error('Error getting SMS balance', ['error' => $e->getMessage()]);
            $data['summary']['sms_balance'] = 0;
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Director Dashboard data retrieved successfully.');
    }
}

