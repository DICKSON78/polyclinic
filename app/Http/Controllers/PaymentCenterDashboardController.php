<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBillPayment;
use App\Models\PatientPaymentCache;
use App\Models\Expense;
use App\Models\PaymentChannel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentCenterDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');
            // Dashboard cards: default to today's data when no dates provided
            $start_date = $request->start_date ?? $today;
            $end_date = $request->end_date ?? $today;

            // Clinic scoping: only apply when explicitly provided, to mirror admin totals for cashiers unless filtered
            $clinic_id = $request->clinic_id ?? null;
            
            \Log::info('PaymentCenterDashboard request', [
                'user_id' => $user->id ?? null,
                'user_is_admin' => $user->is_admin ?? false,
                'clinic_id' => $clinic_id,
                'start_date' => $start_date,
                'end_date' => $end_date,
                'request_clinic_id' => $request->clinic_id,
            ]);

        $data = [
            'summary' => [
                'total_revenue' => 0,
                'cash_payments' => 0,
                'credit_payments' => 0,
                'cash_available' => 0,
                'pending_bills' => 0,
                'pending_payment_cache' => 0,
                'cleared_bills' => 0,
                'total_expenses' => 0,
                'new_expenses' => 0,
                'new_expenses_count' => 0,
                'net_profit' => 0,
                'today_collections' => 0,
            ],
            'statistics' => [
                'payment_trends' => [],
                'revenue_by_payment_mode' => [],
                'mobile_payments_by_channel' => [],
                'top_paying_patients' => [],
                'pending_bills_summary' => [],
            ],
        ];

        // Total revenue from payments (include both item payments and bill payments) plus cleared bills as fallback
        // Only filter by clinic if clinic_id is provided and user is not admin
        // Use try-catch to handle any query errors gracefully
        try {
            $paymentsQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            // Apply clinic filter only if clinic_id is provided
            if ($clinic_id) {
                $paymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $paymentsSum = (float) ($paymentsQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
        } catch (\Exception $e) {
            \Log::error('Error calculating payments sum', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $paymentsSum = 0;
        }
            
        try {
            $billPaymentsQuery = PatientItemBillPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            // Apply clinic filter only if clinic_id is provided
            if ($clinic_id) {
                $billPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $billPaymentsSum = $billPaymentsQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating bill payments sum', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $billPaymentsSum = 0;
        }

        $billsSum = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Cleared')
            ->where('created_at', '>=', $start_date . ' 00:00:00')
            ->where('created_at', '<=', $end_date . ' 23:59:59')
            ->sum(DB::raw('coalesce(amount,0) - coalesce(discount,0)')) ?? 0;
            
        // Prefer actual payments if present; otherwise fall back to cleared bills
        $data['summary']['total_revenue'] = ($paymentsSum + $billPaymentsSum) > 0
            ? ($paymentsSum + $billPaymentsSum)
            : $billsSum;

        // Cash payments amount (must match cash in hand)
        // Enhanced cash detection with multiple patterns and fallbacks
        try {
            $cashItemPaymentsQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0)
                ->where(function ($q) {
                    $q->whereHas('channel', function ($query) {
                        // Comprehensive cash channel detection
                        $query->where(function($subQuery) {
                            $subQuery->whereRaw("LOWER(name) LIKE '%cash%'")
                                   ->orWhereRaw("LOWER(name) = 'cash'")
                                   ->orWhereRaw("LOWER(name) = 'cash in hand'")
                                   ->orWhereRaw("LOWER(name) = 'cash payment'")
                                   ->orWhereRaw("LOWER(name) = 'cash payment'")
                                   ->orWhereRaw("LOWER(name) = 'cash on hand'");
                        });
                    })
                    ->orWhereHas('items.payment_mode', function ($query) {
                        $query->whereRaw('LOWER(payment_type) = ?', ['cash']);
                    })
                    // Fallback: check if channel_id corresponds to cash channels
                    ->orWhereIn('channel_id', function($query) {
                        $query->select('id')
                              ->from('payment_channels')
                              ->whereRaw("LOWER(name) LIKE '%cash%'");
                    });
                });

            if ($clinic_id) {
                $cashItemPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }

            $cashItemPayments = (float) ($cashItemPaymentsQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
        } catch (\Exception $e) {
            \Log::error('Error calculating cash item payments', ['error' => $e->getMessage()]);
            $cashItemPayments = 0;
        }

        try {
            $cashBillPaymentsQuery = PatientItemBillPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0)
                ->where(function ($q) {
                    $q->whereHas('channel', function ($query) {
                        // Comprehensive cash channel detection
                        $query->where(function($subQuery) {
                            $subQuery->whereRaw("LOWER(name) LIKE '%cash%'")
                                   ->orWhereRaw("LOWER(name) = 'cash'")
                                   ->orWhereRaw("LOWER(name) = 'cash in hand'")
                                   ->orWhereRaw("LOWER(name) = 'cash payment'")
                                   ->orWhereRaw("LOWER(name) = 'cash payment'")
                                   ->orWhereRaw("LOWER(name) = 'cash on hand'");
                        });
                    })
                    ->orWhereHas('items.payment_mode', function ($query) {
                        $query->whereRaw('LOWER(payment_type) = ?', ['cash']);
                    })
                    // Fallback: check if channel_id corresponds to cash channels
                    ->orWhereIn('channel_id', function($query) {
                        $query->select('id')
                              ->from('payment_channels')
                              ->whereRaw("LOWER(name) LIKE '%cash%'");
                    });
                });

            if ($clinic_id) {
                $cashBillPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }

            $cashBillPayments = $cashBillPaymentsQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating cash bill payments', ['error' => $e->getMessage()]);
            $cashBillPayments = 0;
        }

        $data['summary']['cash_payments'] = $cashItemPayments + $cashBillPayments;

        // Cash available (collected cash) - only cash item payments, not bill payments
        // This represents actual cash that should be in cash drawer
        $data['summary']['cash_available'] = $cashItemPayments;

        // Credit payments amount (billed/credited items)
        try {
            $creditQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0)
                ->whereHas('items.payment_mode', function ($query) {
                    $query->whereRaw('LOWER(payment_type) = ?', ['credit']);
                })
                ->distinct('patient_item_payments.id');

            if ($clinic_id) {
                $creditQuery->whereHas('creator', function ($q2) use ($clinic_id) {
                    $q2->where('clinic_id', $clinic_id);
                });
            }

            $data['summary']['credit_payments'] = (float) $creditQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating credit payments', ['error' => $e->getMessage()]);
            $data['summary']['credit_payments'] = 0;
        }

        // Pending bills count (only PatientItemBill records to match the pending bills page) in date range
        try {
            $pendingBillsQuery = PatientItemBill::query()
                ->where('status', 'Pending')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            
            if ($clinic_id) {
                $pendingBillsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            // Count and Sum of pending bills created in date range
            $data['summary']['pending_bills_count'] = $pendingBillsQuery->count();
            $data['summary']['pending_bills'] = (float) $pendingBillsQuery->sum('amount');
        } catch (\Exception $e) {
            \Log::error('Error counting pending bills', ['error' => $e->getMessage()]);
            $data['summary']['pending_bills_count'] = 0;
            $data['summary']['pending_bills'] = 0;
        }
            
        // Pending payment cache count (for separate tracking) - should match pending cash patients page, filtered by date range
        try {
            $pendingCacheQuery = PatientPaymentCache::query()
                ->whereHas('items', function ($query) {
                    $query->where('status', 'Pending');
                    $query->whereHas('payment_mode', function ($q) {
                        $q->where('payment_type', 'Cash');
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            
            if ($clinic_id) {
                $pendingCacheQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['pending_payment_cache'] = $pendingCacheQuery->count();
        } catch (\Exception $e) {
            \Log::error('Error counting pending payment cache', ['error' => $e->getMessage()]);
            $data['summary']['pending_payment_cache'] = 0;
        }

        // Cleared bills - filtered by date range
        try {
            $clearedBillsQuery = PatientItemBill::query()
                ->where('status', 'Cleared')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            
            if ($clinic_id) {
                $clearedBillsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['cleared_bills'] = $clearedBillsQuery->count();
        } catch (\Exception $e) {
            \Log::error('Error counting cleared bills', ['error' => $e->getMessage()]);
            $data['summary']['cleared_bills'] = 0;
        }

        // Total expenses - use expense_date instead of created_at to match ExpensesController behavior
        // Also try without clinic filter if clinic_id is null to show all expenses
        $expensesQuery = Expense::query();
        if ($clinic_id) {
            $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
        }
        $data['summary']['total_expenses'] = $expensesQuery
            ->whereDate('expense_date', '>=', $start_date)
            ->whereDate('expense_date', '<=', $end_date)
            ->sum('total_amount') ?? 0;

        // New expenses (created today) - use expense_date to match other expense queries
        $today = Carbon::today()->format('Y-m-d');
        $newExpensesQuery = Expense::query();
        if ($clinic_id) {
            $newExpensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
        }
        $data['summary']['new_expenses'] = $newExpensesQuery
            ->whereDate('expense_date', $today)
            ->sum('total_amount') ?? 0;
        
        $newExpensesCountQuery = Expense::query();
        if ($clinic_id) {
            $newExpensesCountQuery->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
        }
        $data['summary']['new_expenses_count'] = $newExpensesCountQuery
            ->whereDate('expense_date', $today)
            ->count();

        // Net profit
        $data['summary']['net_profit'] = $data['summary']['total_revenue'] - $data['summary']['total_expenses'];

        // Today's collections (both item and bill payments)
        try {
            $todayItemsQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->whereDate('created_at', Carbon::today())
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $todayItemsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $todayItems = (float) ($todayItemsQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
        } catch (\Exception $e) {
            \Log::error('Error calculating today items', ['error' => $e->getMessage()]);
            $todayItems = 0;
        }
        
        try {
            $todayBillsQuery = PatientItemBillPayment::query()
                ->whereNotNull('created_at')
                ->whereDate('created_at', Carbon::today())
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $todayBillsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $todayBills = $todayBillsQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating today bills', ['error' => $e->getMessage()]);
            $todayBills = 0;
        }
        
        $data['summary']['today_collections'] = $todayItems + $todayBills;

        // Payment trends (last 7 days) - include both item payments and bill payments
        $data['statistics']['payment_trends'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            
            try {
                $itemRevenueQuery = PatientItemPayment::query()
                    ->whereNotNull('created_at')
                    ->whereDate('created_at', $date)
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $itemRevenueQuery->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                }
                
                $itemRevenue = $itemRevenueQuery->sum('amount') ?? 0;
            } catch (\Exception $e) {
                \Log::error('Error calculating item revenue for date', ['date' => $date, 'error' => $e->getMessage()]);
                $itemRevenue = 0;
            }
                
            try {
                $billRevenueQuery = PatientItemBillPayment::query()
                    ->whereNotNull('created_at')
                    ->whereDate('created_at', $date)
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $billRevenueQuery->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                }
                
                $billRevenue = $billRevenueQuery->sum('amount') ?? 0;
            } catch (\Exception $e) {
                \Log::error('Error calculating bill revenue for date', ['date' => $date, 'error' => $e->getMessage()]);
                $billRevenue = 0;
            }

            $revenue = $itemRevenue + $billRevenue;

            $data['statistics']['payment_trends'][] = [
                'date' => $date,
                'revenue' => $revenue
            ];
        }

        // Revenue by payment channel (combine item payments and bill payments)
        try {
            $itemChannelQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.channel_id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.amount', '>', 0)
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $itemChannelQuery->whereHas('creator', function ($q2) use ($clinic_id) {
                    $q2->where('clinic_id', $clinic_id);
                });
            }
            
            $itemChannel = $itemChannelQuery
                ->join('payment_channels', 'patient_item_payments.channel_id', '=', 'payment_channels.id')
                ->groupBy('payment_channels.id', 'payment_channels.name')
                ->get([
                    DB::raw('payment_channels.name as payment_mode'),
                    DB::raw('SUM(patient_item_payments.amount) as total_amount')
                ]);
        } catch (\Exception $e) {
            \Log::error('Error getting item channel revenue', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $itemChannel = collect([]);
        }
        
        try {
            $billChannelQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.channel_id')
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $billChannelQuery->whereHas('creator', function ($q2) use ($clinic_id) {
                    $q2->where('clinic_id', $clinic_id);
                });
            }
            
            $billChannel = $billChannelQuery
                ->join('payment_channels', 'patient_item_bill_payments.channel_id', '=', 'payment_channels.id')
                ->groupBy('payment_channels.id', 'payment_channels.name')
                ->get([
                    DB::raw('payment_channels.name as payment_mode'),
                    DB::raw('SUM(patient_item_bill_payments.amount) as total_amount')
                ]);
        } catch (\Exception $e) {
            \Log::error('Error getting bill channel revenue', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $billChannel = collect([]);
        }
        $data['statistics']['revenue_by_payment_mode'] = collect($itemChannel)->concat($billChannel)
            ->groupBy('payment_mode')
            ->map(function ($group) {
                return [
                    'payment_mode' => $group->first()->payment_mode,
                    'total_amount' => (float) $group->sum('total_amount'),
                ];
            })
            ->values()
            ->toArray();

        // Mobile payments breakdown by channel (M-Pesa, NMb, CRDB, etc.)
        $mobileChannelNames = ['M-Pesa', 'Mpesa', 'NMB', 'NMb', 'CRDB', 'Tigo Pesa', 'Airtel Money', 'Halo Pesa', 'Ezy Pesa'];
        try {
            $mobileItemsQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.channel_id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.amount', '>', 0)
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $mobileItemsQuery->whereHas('creator', function ($q2) use ($clinic_id) {
                    $q2->where('clinic_id', $clinic_id);
                });
            }
            
            $mobileItems = $mobileItemsQuery
                ->join('payment_channels', 'patient_item_payments.channel_id', '=', 'payment_channels.id')
                ->whereIn('payment_channels.name', $mobileChannelNames)
                ->groupBy('payment_channels.id', 'payment_channels.name')
                ->get([
                    DB::raw('payment_channels.name as channel_name'),
                    DB::raw('SUM(patient_item_payments.amount) as total_amount')
                ]);
        } catch (\Exception $e) {
            \Log::error('Error getting mobile item payments', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $mobileItems = collect([]);
        }
        
        try {
            $mobileBillsQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.channel_id')
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $mobileBillsQuery->whereHas('creator', function ($q2) use ($clinic_id) {
                    $q2->where('clinic_id', $clinic_id);
                });
            }
            
            $mobileBills = $mobileBillsQuery
                ->join('payment_channels', 'patient_item_bill_payments.channel_id', '=', 'payment_channels.id')
                ->whereIn('payment_channels.name', $mobileChannelNames)
                ->groupBy('payment_channels.id', 'payment_channels.name')
                ->get([
                    DB::raw('payment_channels.name as channel_name'),
                    DB::raw('SUM(patient_item_bill_payments.amount) as total_amount')
                ]);
        } catch (\Exception $e) {
            \Log::error('Error getting mobile bill payments', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $mobileBills = collect([]);
        }
        $data['statistics']['mobile_payments_by_channel'] = collect($mobileItems)->concat($mobileBills)
            ->groupBy('channel_name')
            ->map(function ($group) {
                return [
                    'channel' => $group->first()->channel_name,
                    'amount' => (float) $group->sum('total_amount'),
                ];
            })
            ->values()
            ->toArray();

        // Top paying patients (real data) - include both item payments and bill payments
        // Use try-catch to handle any query errors gracefully
        try {
            $topPayingPatientsQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
                
            // Apply clinic filter through creator relationship BEFORE joins
            if ($clinic_id) {
                $topPayingPatientsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $topItemPayments = $topPayingPatientsQuery
                ->join('patient_payment_cache_items', 'patient_payment_cache_items.item_payment_id', '=', 'patient_item_payments.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->join('patients', 'patient_check_ins.patient_id', '=', 'patients.id')
                ->whereNotNull('patients.id')
                ->select(
                    'patients.id',
                    'patients.first_name', 
                    'patients.last_name', 
                    DB::raw('CONCAT(COALESCE(patients.first_name, ""), " ", COALESCE(patients.last_name, "")) as patient_name'),
                    DB::raw('SUM(patient_item_payments.amount) as total_paid')
                )
                ->groupBy('patients.id', 'patients.first_name', 'patients.last_name')
                ->get();
                
            // Also get bill payments
            $topBillPaymentsQuery = PatientItemBillPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
                
            if ($clinic_id) {
                $topBillPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $topBillPayments = $topBillPaymentsQuery
                ->join('patient_item_bills', 'patient_item_bill_payments.bill_id', '=', 'patient_item_bills.id')
                ->join('patient_check_ins', 'patient_item_bills.check_in_id', '=', 'patient_check_ins.id')
                ->join('patients', 'patient_check_ins.patient_id', '=', 'patients.id')
                ->whereNotNull('patients.id')
                ->select(
                    'patients.id',
                    'patients.first_name', 
                    'patients.last_name', 
                    DB::raw('CONCAT(COALESCE(patients.first_name, ""), " ", COALESCE(patients.last_name, "")) as patient_name'),
                    DB::raw('SUM(patient_item_bill_payments.amount) as total_paid')
                )
                ->groupBy('patients.id', 'patients.first_name', 'patients.last_name')
                ->get();
                
            // Combine and aggregate - safely handle null/empty groups
            $combined = collect($topItemPayments)->concat($topBillPayments)
                ->filter(function($item) {
                    return $item && isset($item->id) && $item->id !== null;
                })
                ->groupBy('id')
                ->map(function ($group) {
                    $first = $group->first();
                    if (!$first || !isset($first->id) || $first->id === null) {
                        return null;
                    }
                    return [
                        'id' => (int) $first->id,
                        'first_name' => $first->first_name ?? '',
                        'last_name' => $first->last_name ?? '',
                        'patient_name' => $first->patient_name ?? trim(($first->first_name ?? '') . ' ' . ($first->last_name ?? '')),
                        'total_paid' => (float) $group->sum('total_paid'),
                    ];
                })
                ->filter(function($item) {
                    return $item !== null && isset($item['id']);
                })
                ->sortByDesc('total_paid')
                ->take(3)
                ->values()
                ->toArray();
                
            $data['statistics']['top_paying_patients'] = $combined;
        } catch (\Exception $e) {
            \Log::error('Failed to get top paying patients', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $data['statistics']['top_paying_patients'] = [];
        }

        // Pending bills summary
        // Filter by date range to avoid "all-time" totals
        $pendingBillsSummaryQuery = PatientItemBill::query()
            ->where('status', 'Pending')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date);

        $data['statistics']['pending_bills_summary'] = $pendingBillsSummaryQuery
            ->select('id', 'amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Ensure all numeric values are properly cast
        $data['summary']['total_revenue'] = (float) $data['summary']['total_revenue'];
        $data['summary']['cash_payments'] = (float) $data['summary']['cash_payments'];
        $data['summary']['credit_payments'] = (float) $data['summary']['credit_payments'];
        $data['summary']['cash_available'] = (float) $data['summary']['cash_available'];
        $data['summary']['total_expenses'] = (float) $data['summary']['total_expenses'];
        $data['summary']['net_profit'] = (float) $data['summary']['net_profit'];
        $data['summary']['today_collections'] = (float) $data['summary']['today_collections'];
        $data['summary']['new_expenses'] = (float) $data['summary']['new_expenses'];
        
        // Ensure statistics arrays are properly formatted
        $data['statistics']['payment_trends'] = array_map(function($item) {
            return [
                'date' => $item['date'],
                'revenue' => (float) ($item['revenue'] ?? 0)
            ];
        }, $data['statistics']['payment_trends']);
        
        $data['statistics']['revenue_by_payment_mode'] = array_map(function($item) {
            return [
                'payment_mode' => $item['payment_mode'] ?? 'Unknown',
                'total_amount' => (float) ($item['total_amount'] ?? 0)
            ];
        }, $data['statistics']['revenue_by_payment_mode']);
        
        $data['statistics']['mobile_payments_by_channel'] = array_map(function($item) {
            return [
                'channel' => $item['channel'] ?? 'Unknown',
                'amount' => (float) ($item['amount'] ?? 0)
            ];
        }, $data['statistics']['mobile_payments_by_channel']);

        // Debug logging to help diagnose issues
        // Also check raw counts to see if data exists
        $totalExpensesCount = Expense::count();
        $totalPaymentsCount = PatientItemPayment::count();
        $totalBillsCount = PatientItemBill::count();
        
        // Check if we have any payments in the date range (for debugging)
        $paymentsInRange = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereNotNull('created_at')
            ->where('created_at', '>=', $start_date . ' 00:00:00')
            ->where('created_at', '<=', $end_date . ' 23:59:59')
            ->count();
        
        \Log::info('PaymentCenterDashboard data', [
            'clinic_id' => $clinic_id,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'user_id' => $user->id ?? null,
            'user_is_admin' => $user->is_admin ?? false,
            'total_revenue' => $data['summary']['total_revenue'],
            'cash_payments' => $data['summary']['cash_payments'],
            'credit_payments' => $data['summary']['credit_payments'],
            'total_expenses' => $data['summary']['total_expenses'],
            'pending_bills' => $data['summary']['pending_bills'],
            'cleared_bills' => $data['summary']['cleared_bills'],
            'payment_trends_count' => count($data['statistics']['payment_trends']),
            'revenue_by_mode_count' => count($data['statistics']['revenue_by_payment_mode']),
            'mobile_payments_count' => count($data['statistics']['mobile_payments_by_channel']),
            'debug_total_expenses_count' => $totalExpensesCount,
            'debug_total_payments_count' => $totalPaymentsCount,
            'debug_total_bills_count' => $totalBillsCount,
            'debug_payments_in_range' => $paymentsInRange,
            'payments_sum' => $paymentsSum,
            'bill_payments_sum' => $billPaymentsSum,
        ]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Payment Center Dashboard data retrieved successfully.');
        
        } catch (\Throwable $e) {
            \Log::error('PaymentCenterDashboard failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe default data instead of 500 error
            return $this->sendResponse([
                'summary' => [
                    'total_revenue' => 0,
                    'cash_payments' => 0,
                    'credit_payments' => 0,
                    'cash_available' => 0,
                    'pending_bills' => 0,
                    'pending_payment_cache' => 0,
                    'cleared_bills' => 0,
                    'total_expenses' => 0,
                    'net_profit' => 0,
                    'today_collections' => 0,
                ],
                'statistics' => [
                    'payment_trends' => [],
                    'revenue_by_payment_mode' => [],
                    'mobile_payments_by_channel' => [],
                    'top_paying_patients' => [],
                    'pending_bills_summary' => [],
                ],
            ], Response::HTTP_OK, 'Dashboard data temporarily unavailable.');
        }
    }
}
