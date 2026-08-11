<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientItemPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SalesManagementDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            
            // Check access permissions - allow Sales Manager and Sales roles
            $privArray = is_object($user->privileges ?? null) ? (array) $user->privileges : (is_array($user->privileges ?? null) ? $user->privileges : []);
            
            // Debug logging for user permissions
            \Log::info('Sales Dashboard Access Attempt', [
                'user_id' => $user->id ?? null,
                'user_name' => ($user->first_name ?? '') . ' ' . ($user->last_name ?? ''),
                'user_role' => $user->role ?? null,
                'user_is_admin' => $user->is_admin ?? false,
                'user_privileges' => $user->privileges ?? null,
                'priv_array' => $privArray ?? [],
                'has_sales_center' => !empty($privArray['sales_center']),
                'has_sales_management' => !empty($privArray['sales_management']),
                'in_allowed_roles' => in_array($user->role, ['Admin', 'Director', 'Sales Manager', 'Sales']),
            ]);
            
            // Allow access if: Admin OR (allowed role AND has sales_center OR sales_management privilege)
            $hasRequiredPrivilege = !empty($privArray['sales_management']) || !empty($privArray['sales_center']);
            $hasAllowedRole = in_array($user->role, ['Admin', 'Director', 'Sales Manager', 'Sales']);
            
            if (!$user || (!$user->is_admin && (!$hasAllowedRole || !$hasRequiredPrivilege))) {
                \Log::warning('Sales Dashboard Access Denied', [
                    'user_id' => $user->id ?? null,
                    'user_role' => $user->role ?? null,
                    'has_allowed_role' => $hasAllowedRole,
                    'has_required_privilege' => $hasRequiredPrivilege,
                    'reason' => 'Not in allowed roles or missing sales privileges'
                ]);
                return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied');
            }
            
            // Default to today if no dates provided
            $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            $data = [
                'summary' => [
                    'total_sales' => 0,
                    'sales_today' => 0,
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'total_discounts' => 0,
                    'items_sold' => 0,
                ],
                'statistics' => [
                    'sales_by_category' => [],
                    'sales_by_day' => [],
                    'sales_trend' => [],
                    'top_customers' => [],
                    'clients_consulted_vs_sales' => [],
                    'prescription_demand' => [],
                ],
            ];

            // Total sales from patient_item_bills (real data source)
            try {
                $totalSalesQuery = DB::table('patient_item_bills')
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $totalSalesQuery->whereExists(function ($query) use ($clinic_id) {
                        $query->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'patient_item_bills.created_by')
                            ->where('users.clinic_id', $clinic_id);
                    });
                }
                
                // Use net amount (amount - discount) to match real sales
                $data['summary']['total_sales'] = (float) ($totalSalesQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
            } catch (\Exception $e) {
                \Log::error('Error calculating total sales', ['error' => $e->getMessage()]);
                $data['summary']['total_sales'] = 0;
            }

            // Sales today
            try {
                $today = Carbon::today()->format('Y-m-d');
                $salesTodayQuery = DB::table('patient_item_bills')
                    ->whereNotNull('created_at')
                    ->whereDate('created_at', $today)
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $salesTodayQuery->whereExists(function ($query) use ($clinic_id) {
                        $query->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'patient_item_bills.created_by')
                            ->where('users.clinic_id', $clinic_id);
                    });
                }
                
                // Use net amount (amount - discount) to match real sales
                $data['summary']['sales_today'] = (float) ($salesTodayQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
            } catch (\Exception $e) {
                \Log::error('Error calculating sales today', ['error' => $e->getMessage()]);
                $data['summary']['sales_today'] = 0;
            }

            // Total revenue (same as total sales for now)
            $data['summary']['total_revenue'] = $data['summary']['total_sales'];

            // Total transactions from patient_item_bills
            try {
                $transactionsQuery = DB::table('patient_item_bills')
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $transactionsQuery->whereExists(function ($query) use ($clinic_id) {
                        $query->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'patient_item_bills.created_by')
                            ->where('users.clinic_id', $clinic_id);
                    });
                }
                
                $data['summary']['total_transactions'] = $transactionsQuery->count();
            } catch (\Exception $e) {
                \Log::error('Error calculating total transactions', ['error' => $e->getMessage()]);
                $data['summary']['total_transactions'] = 0;
            }

            // Average transaction
            if ($data['summary']['total_transactions'] > 0) {
                $data['summary']['average_transaction'] = $data['summary']['total_sales'] / $data['summary']['total_transactions'];
            }

            // Get performance targets from consolidated table
            $targets = DB::table('performance_targets')
                ->where('department', 'sales')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->pluck('target', 'kpi_id');

            $salesTarget = $targets['revenue_generated'] ?? 5000000;

            // Calculate sales performance percentage
            $salesPerformance = $data['summary']['total_sales'] > 0 
                ? (($data['summary']['total_sales'] / $salesTarget) * 100) 
                : 0;

            $data['summary']['sales_target'] = $salesTarget;
            $data['summary']['sales_performance'] = round($salesPerformance, 1);

            // Items sold from patient_item_bills
            try {
                $itemsSoldQuery = DB::table('patient_item_bills')
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->where('amount', '>', 0);
                
                if ($clinic_id) {
                    $itemsSoldQuery->whereExists(function ($query) use ($clinic_id) {
                        $query->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'patient_item_bills.created_by')
                            ->where('users.clinic_id', $clinic_id);
                    });
                }
                
                $data['summary']['items_sold'] = $itemsSoldQuery->count() ?? 0;
            } catch (\Exception $e) {
                \Log::error('Error calculating items sold', ['error' => $e->getMessage()]);
                $data['summary']['items_sold'] = 0;
            }

            // Total discounts from patient_item_bills
            try {
                $discountsQuery = DB::table('patient_item_bills')
                    ->whereNotNull('created_at')
                    ->where('created_at', '>=', $start_date . ' 00:00:00')
                    ->where('created_at', '<=', $end_date . ' 23:59:59')
                    ->where('discount', '>', 0);
                
                if ($clinic_id) {
                    $discountsQuery->whereExists(function ($query) use ($clinic_id) {
                        $query->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'patient_item_bills.created_by')
                            ->where('users.clinic_id', $clinic_id);
                    });
                }
                
                $data['summary']['total_discounts'] = (float) ($discountsQuery->sum('discount') ?? 0);
            } catch (\Exception $e) {
                \Log::error('Error calculating total discounts', ['error' => $e->getMessage()]);
                $data['summary']['total_discounts'] = 0;
            }

            // Sales trend (last 7 days)
            $data['statistics']['sales_trend'] = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                try {
                    $salesQuery = DB::table('patient_item_bills')
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $date)
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $salesQuery->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $sales = $salesQuery->sum('amount') ?? 0;
                } catch (\Exception $e) {
                    \Log::error('Error calculating sales trend for date', ['date' => $date, 'error' => $e->getMessage()]);
                    $sales = 0;
                }

                $data['statistics']['sales_trend'][] = [
                    'date' => $date,
                    'sales' => $sales
                ];
            }

            // Clients Consulted vs Successful Sales (daily breakdown for the period)
            $clientsConsultedVsSales = [];
            $currentDate = Carbon::parse($start_date);
            $endDate = Carbon::parse($end_date);
            
            while ($currentDate->lte($endDate)) {
                $dateStr = $currentDate->format('Y-m-d');
                
                // Clients consulted on this date
                try {
                    $clientsConsultedQuery = Consultation::query()
                        ->where('consultations.status', 'Consulted')
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $dateStr);
                    
                    if ($clinic_id) {
                        $clientsConsultedQuery->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $clientsConsulted = $clientsConsultedQuery
                        ->distinct('payment_cache_item_id')
                        ->count('payment_cache_item_id');
                } catch (\Exception $e) {
                    \Log::error('Error calculating clients consulted for date', ['date' => $dateStr, 'error' => $e->getMessage()]);
                    $clientsConsulted = 0;
                }
                
                // Successful sales (payments made) on this date
                try {
                    $successfulSalesQuery = PatientItemPayment::query()
                        ->whereNotNull('created_at')
                        ->whereDate('created_at', $dateStr)
                        ->where('amount', '>', 0);
                    
                    if ($clinic_id) {
                        $successfulSalesQuery->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $successfulSales = $successfulSalesQuery->count();
                } catch (\Exception $e) {
                    \Log::error('Error calculating successful sales for date', ['date' => $dateStr, 'error' => $e->getMessage()]);
                    $successfulSales = 0;
                }
                
                $clientsConsultedVsSales[] = [
                    'date' => $dateStr,
                    'clients_consulted' => $clientsConsulted,
                    'successful_sales' => $successfulSales,
                ];
                
                $currentDate->addDay();
            }
            
            $data['statistics']['clients_consulted_vs_sales'] = $clientsConsultedVsSales;

            // Prescription Demand (pharmacy items sold by date)
            $prescriptionDemand = [];
            $currentDate = Carbon::parse($start_date);
            $endDate = Carbon::parse($end_date);
            
            while ($currentDate->lte($endDate)) {
                $dateStr = $currentDate->format('Y-m-d');
                
                // Pharmacy items sold on this date
                try {
                    $pharmacyItemsQuery = PatientPaymentCacheItem::query()
                        ->whereHas('consultation_type', function ($query) {
                            $query->where('name', 'Pharmacy');
                        })
                        ->where('patient_payment_cache_items.status', 'Served')
                        ->whereNotNull('served_at')
                        ->whereDate('served_at', $dateStr);
                    
                    if ($clinic_id) {
                        $pharmacyItemsQuery->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    }
                    
                    $pharmacyItems = $pharmacyItemsQuery->sum('quantity') ?? 0;
                } catch (\Exception $e) {
                    \Log::error('Error calculating pharmacy items for date', ['date' => $dateStr, 'error' => $e->getMessage()]);
                    $pharmacyItems = 0;
                }
                
                $prescriptionDemand[] = [
                    'date' => $dateStr,
                    'quantity' => $pharmacyItems,
                ];
                
                $currentDate->addDay();
            }
            
            $data['statistics']['prescription_demand'] = $prescriptionDemand;

            // Sales by category
            try {
                $salesByCategoryQuery = PatientPaymentCacheItem::query()
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->whereNotNull('served_at')
                    ->where('served_at', '>=', $start_date . ' 00:00:00')
                    ->where('served_at', '<=', $end_date . ' 23:59:59');
                
                if ($clinic_id) {
                    $salesByCategoryQuery->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                }
                
                $data['statistics']['sales_by_category'] = $salesByCategoryQuery
                    ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                    ->select(
                        'consultation_types.name',
                        DB::raw('SUM(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_sales'),
                        DB::raw('SUM(patient_payment_cache_items.quantity) as total_quantity')
                    )
                    ->groupBy('consultation_types.id', 'consultation_types.name')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'name' => $item->name,
                            'total_sales' => (float) $item->total_sales,
                            'total_quantity' => (int) $item->total_quantity,
                        ];
                    });
            } catch (\Exception $e) {
                \Log::error('Error calculating sales by category', ['error' => $e->getMessage()]);
                $data['statistics']['sales_by_category'] = [];
            }

            // Top customers
            try {
                $topCustomersQuery = PatientItemPayment::query()
                    ->whereNotNull('patient_item_payments.created_at')
                    ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                    ->where('patient_item_payments.amount', '>', 0);
                
                if ($clinic_id) {
                    $topCustomersQuery->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                }
                
                $data['statistics']['top_customers'] = $topCustomersQuery
                    ->join('patient_payment_cache_items', 'patient_payment_cache_items.item_payment_id', '=', 'patient_item_payments.id')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                    ->join('patients', 'patient_check_ins.patient_id', '=', 'patients.id')
                    ->whereNotNull('patients.id')
                    ->select(
                        'patients.id',
                        'patients.first_name',
                        'patients.last_name',
                        DB::raw('CONCAT(COALESCE(patients.first_name, ""), " ", COALESCE(patients.last_name, "")) as customer_name'),
                        DB::raw('SUM(patient_item_payments.amount) as total_paid')
                    )
                    ->groupBy('patients.id', 'patients.first_name', 'patients.last_name')
                    ->orderBy('total_paid', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'customer_name' => trim($item->customer_name ?? ($item->first_name . ' ' . $item->last_name)),
                            'total_paid' => (float) ($item->total_paid ?? 0),
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                \Log::error('Error calculating top customers', ['error' => $e->getMessage()]);
                $data['statistics']['top_customers'] = [];
            }

            // Debug logging
            \Log::info('SalesManagementDashboard data', [
                'clinic_id' => $clinic_id,
                'start_date' => $start_date,
                'end_date' => $end_date,
                'user_id' => $user->id ?? null,
                'user_is_admin' => $user->is_admin ?? false,
                'total_sales' => $data['summary']['total_sales'],
                'sales_today' => $data['summary']['sales_today'],
                'total_transactions' => $data['summary']['total_transactions'],
                'average_transaction' => $data['summary']['average_transaction'],
                'items_sold' => $data['summary']['items_sold'],
                'sales_trend_count' => count($data['statistics']['sales_trend']),
                'clients_consulted_vs_sales_count' => count($data['statistics']['clients_consulted_vs_sales']),
                'prescription_demand_count' => count($data['statistics']['prescription_demand']),
                'sales_by_category_count' => count($data['statistics']['sales_by_category']),
                'top_customers_count' => count($data['statistics']['top_customers']),
            ]);

            return $this->sendResponse($data, Response::HTTP_OK, 'Sales Management Dashboard data retrieved successfully.');
            
        } catch (\Throwable $e) {
            \Log::error('SalesManagementDashboard failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe default data instead of 500 error
            return $this->sendResponse([
                'summary' => [
                    'total_sales' => 0,
                    'sales_today' => 0,
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'total_discounts' => 0,
                    'items_sold' => 0,
                ],
                'statistics' => [
                    'sales_by_category' => [],
                    'sales_by_day' => [],
                    'sales_trend' => [],
                    'top_customers' => [],
                    'clients_consulted_vs_sales' => [],
                    'prescription_demand' => [],
                ],
            ], Response::HTTP_OK, 'Dashboard data temporarily unavailable.');
        }
    }
}

