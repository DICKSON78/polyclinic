<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Stocktake;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InventoryManagementDashboardController extends Controller
{
    use ApiResponse;

    /**
     * Safely execute a callback and return a default on failure.
     */
    protected function safe($callback, $default)
    {
        try {
            return $callback();
        } catch (\Throwable $e) {
            \Log::error('InventoryManagementDashboard query failed', ['error' => $e->getMessage()]);
            return $default;
        }
    }

    public function __invoke(Request $request)
    {
        $user = $request->user();
        // Default to today if no dates provided
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id ?? null;
        }

        // Optional filters for individual item performance
        $frame_id = $request->frame_id ? (int) $request->frame_id : null;
        $medicine_id = $request->medicine_id ? (int) $request->medicine_id : null;

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Get inventory statistics using the items table for backward compatibility
        $data['summary']['total_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->count();
        }, 0);

        $data['summary']['low_stock_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where(function($query) {
                    $query->whereRaw('items.balance <= items.minimum_stock AND items.minimum_stock > 0')
                          ->orWhere('items.balance', 0);
                })
                ->count();
        }, 0);

        // Calculate stock in today from stocktakes
        $data['summary']['stock_in_today'] = $this->safe(function () use ($clinic_id) {
            return Stocktake::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', Carbon::today())
                ->count();
        }, 0);

        // Calculate stock out today from dispensing
        $data['summary']['stock_out_today'] = $this->safe(function () use ($clinic_id) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', Carbon::today())
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->count();
        }, 0);

        // Add new summary cards: Total lens, total medicine, total frame
        $data['summary']['total_lens'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->sum('items.balance');
        }, 0);

        $data['summary']['total_medicine'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Pharmaceutical')
                ->where('consultation_types.name', 'Pharmacy')
                ->sum('items.balance');
        }, 0);

        $data['summary']['total_frame'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Frame')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->sum('items.balance');
        }, 0);

        // Get inventory items by type
        $data['statistics']['items_by_type'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->select('item_types.name', DB::raw('count(*) as count'))
                ->groupBy('item_types.id', 'item_types.name')
                ->get();
        }, []);

        // Get top dispensed inventory items
        $data['statistics']['top_items'] = $this->safe(function () use ($clinic_id, $start_date, $end_date) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', $start_date)
                ->whereDate('patient_payment_cache.created_at', '<=', $end_date)
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->select('items.name', DB::raw('sum(patient_payment_cache_items.quantity) as total_quantity'), DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue'))
                ->groupBy('items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(5)
                ->get();
        }, []);

        // Get inventory dispensing trend (last 7 days)
        $data['statistics']['dispensing_trend'] = $this->safe(function () use ($clinic_id) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(7))
                ->whereNotNull('patient_payment_cache_items.item_id')
                ->select(DB::raw('DATE(patient_payment_cache.created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        }, []);

        // ========== FRAME STOCK SECTION ==========
        // Frame categories pie chart (grouped by category or item_type if category is null)
        $data['statistics']['frame_categories'] = $this->safe(function () use ($clinic_id) {
            $result = DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Frame')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->select(
                    DB::raw('COALESCE(items.category, "Uncategorized") as category'),
                    DB::raw('SUM(items.balance) as total_quantity')
                )
                ->groupBy('items.category')
                ->havingRaw('SUM(items.balance) > 0') // Only show items with stock
                ->get();

            // If no frame categories found, provide fallback data
            if ($result->isEmpty()) {
                // Check if there are any frame items at all
                $frameCount = DB::table('items')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('items.clinic_id', $clinic_id);
                    })
                    ->where('items.status', 'Active')
                    ->where('items.is_stock_item', 'Yes')
                    ->where('item_types.name', 'Frame')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->sum('items.balance');

                if ($frameCount > 0) {
                    // Return a single "General" category if frames exist but no categories defined
                    $result = collect([[
                        'category' => 'General',
                        'total_quantity' => (float) $frameCount,
                    ]]);
                }
            }

            // Ensure we return an array of objects with the correct structure
            return $result->map(function ($item) {
                return [
                    'category' => $item->category ?? 'Uncategorized',
                    'total_quantity' => (float) ($item->total_quantity ?? 0),
                ];
            })->toArray();
        }, []);

        // Frame stock-in vs stock-out by category (last 30 days)
        $data['statistics']['frame_stock_movement'] = $this->safe(function () use ($clinic_id) {
            $categories = DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Frame')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->select(DB::raw('DISTINCT COALESCE(items.category, "Uncategorized") as category'))
                ->pluck('category');

            $movement = [];
            foreach ($categories as $category) {
                // Stock-in from stocktakes
                $stockIn = DB::table('stocktake_items')
                    ->join('stocktakes', 'stocktake_items.stocktake_id', '=', 'stocktakes.id')
                    ->join('items', 'stocktake_items.item_id', '=', 'items.id')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->join('users', 'stocktakes.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('users.clinic_id', $clinic_id);
                    })
                    ->where('items.status', 'Active')
                    ->where('item_types.name', 'Frame')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->where(DB::raw('COALESCE(items.category, "Uncategorized")'), $category)
                    ->whereDate('stocktakes.created_at', '>=', Carbon::now()->subDays(30))
                    ->sum('stocktake_items.quantity');

                // Stock-out from dispensing
                $stockOut = DB::table('patient_payment_cache_items')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('users.clinic_id', $clinic_id);
                    })
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->where('items.status', 'Active')
                    ->where('item_types.name', 'Frame')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->where(DB::raw('COALESCE(items.category, "Uncategorized")'), $category)
                    ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(30))
                    ->sum('patient_payment_cache_items.quantity');

                $movement[] = [
                    'category' => $category,
                    'stock_in' => $stockIn ?? 0,
                    'stock_out' => $stockOut ?? 0,
                ];
            }
            return $movement;
        }, []);

        // ========== LENS STOCK SECTION ==========
        // Lens types pie chart (Blue-cut, Transition, Bifocal, Progressive)
        $data['statistics']['lens_types'] = $this->safe(function () use ($clinic_id) {
            $result = DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->leftJoin('lens_types', 'items.lens_type_id', '=', 'lens_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->select(
                    DB::raw('COALESCE(lens_types.name, items.category, "Unspecified") as lens_type'),
                    DB::raw('SUM(items.balance) as total_quantity')
                )
                ->groupBy(DB::raw('COALESCE(lens_types.name, items.category, "Unspecified")'))
                ->get();

            // If no lens types found, provide fallback data
            if ($result->isEmpty()) {
                // Check if there are any lens items at all
                $lensCount = DB::table('items')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('items.clinic_id', $clinic_id);
                    })
                    ->where('items.status', 'Active')
                    ->where('items.is_stock_item', 'Yes')
                    ->where('item_types.name', 'Lens')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->sum('items.balance');

                if ($lensCount > 0) {
                    // Return a single "General" category if lenses exist but no types defined
                    $result = collect([[
                        'lens_type' => 'General',
                        'total_quantity' => (float) $lensCount,
                    ]]);
                }
            }
            
            // Ensure we return an array of objects with the correct structure
            return $result->map(function ($item) {
                return [
                    'lens_type' => $item->lens_type ?? 'Unspecified',
                    'total_quantity' => (float) ($item->total_quantity ?? 0),
                ];
            })->toArray();
        }, []);

        // Complete lens list (for lens list page)
        $data['statistics']['lens_list'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->leftJoin('lens_types', 'items.lens_type_id', '=', 'lens_types.id')
                ->leftJoin('units_of_measure', 'items.unit_of_measure_id', '=', 'units_of_measure.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->select(
                    'items.id',
                    'items.name',
                    'items.code',
                    'items.category',
                    'items.balance',
                    'items.unit_buying_price',
                    'items.minimum_stock',
                    'lens_types.name as lens_type',
                    'units_of_measure.name as unit_of_measure'
                )
                ->get();
        }, []);

        // ========== LENS TRACKING SECTION ==========
        // Fast-moving lenses (based on sales volume - last 30 days)
        $data['statistics']['fast_moving_lenses'] = $this->safe(function () use ($clinic_id) {
            return DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->leftJoin('lens_types', 'items.lens_type_id', '=', 'lens_types.id')
                ->leftJoin('units_of_measure', 'items.unit_of_measure_id', '=', 'units_of_measure.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->where('items.status', 'Active')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(30))
                ->select(
                    'items.id',
                    'items.name',
                    'items.code',
                    'items.category',
                    'items.balance',
                    'items.unit_buying_price',
                    'items.minimum_stock',
                    'lens_types.name as lens_type',
                    'units_of_measure.name as unit_of_measure',
                    DB::raw('SUM(patient_payment_cache_items.quantity) as total_sold'),
                    DB::raw('COUNT(DISTINCT patient_payment_cache_items.payment_cache_id) as total_transactions')
                )
                ->groupBy(
                    'items.id',
                    'items.name',
                    'items.code',
                    'items.category',
                    'items.balance',
                    'items.unit_buying_price',
                    'items.minimum_stock',
                    'lens_types.name',
                    'units_of_measure.name'
                )
                ->orderBy('total_sold', 'desc')
                ->limit(20)
                ->get();
        }, []);

        // Currently in stock lenses (with stock levels)
        $data['statistics']['in_stock_lenses'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->leftJoin('lens_types', 'items.lens_type_id', '=', 'lens_types.id')
                ->leftJoin('units_of_measure', 'items.unit_of_measure_id', '=', 'units_of_measure.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->where('items.balance', '>', 0)
                ->select(
                    'items.id',
                    'items.name',
                    'items.code',
                    'items.category',
                    'items.balance',
                    'items.unit_buying_price',
                    'items.minimum_stock',
                    'lens_types.name as lens_type',
                    'units_of_measure.name as unit_of_measure'
                )
                ->orderBy('items.balance', 'desc')
                ->get();
        }, []);

        // Lenses about to run out (low stock alerts)
        $data['statistics']['low_stock_lenses'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->leftJoin('lens_types', 'items.lens_type_id', '=', 'lens_types.id')
                ->leftJoin('units_of_measure', 'items.unit_of_measure_id', '=', 'units_of_measure.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Lens')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->where(function($query) {
                    $query->whereRaw('items.balance <= items.minimum_stock AND items.minimum_stock > 0')
                          ->orWhere('items.balance', 0);
                })
                ->select(
                    'items.id',
                    'items.name',
                    'items.code',
                    'items.category',
                    'items.balance',
                    'items.unit_buying_price',
                    'items.minimum_stock',
                    'lens_types.name as lens_type',
                    'units_of_measure.name as unit_of_measure',
                    DB::raw('CASE 
                        WHEN items.balance = 0 THEN "Out of Stock"
                        WHEN items.balance <= items.minimum_stock THEN "Low Stock"
                        ELSE "Normal"
                    END as stock_status')
                )
                ->orderBy('items.balance', 'asc')
                ->get();
        }, []);

        // Lens sales trends (last 7 days)
        $data['statistics']['lens_sales_trends'] = $this->safe(function () use ($clinic_id) {
            $trends = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $sales = DB::table('patient_payment_cache_items')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('users.clinic_id', $clinic_id);
                    })
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->where('items.status', 'Active')
                    ->where('item_types.name', 'Lens')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->whereDate('patient_payment_cache.created_at', $date)
                    ->sum('patient_payment_cache_items.quantity');
                
                $trends[] = [
                    'date' => $date,
                    'quantity_sold' => $sales ?? 0,
                ];
            }
            return $trends;
        }, []);

        // ========== PHARMACY STOCK SECTION ==========
        // Pharmacy items by category (pie chart)
        $data['statistics']['pharmacy_categories'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('consultation_types.name', 'Pharmacy')
                ->select(
                    DB::raw('COALESCE(items.category, "Uncategorized") as category'),
                    DB::raw('SUM(items.balance) as total_quantity'),
                    DB::raw('COUNT(*) as item_count')
                )
                ->groupBy('items.category')
                ->get();
        }, []);

        // Pharmacy stock-in vs stock-out (last 30 days)
        $data['statistics']['pharmacy_stock_movement'] = $this->safe(function () use ($clinic_id) {
            // Stock-in from stocktakes
            $stockIn = DB::table('stocktake_items')
                ->join('stocktakes', 'stocktake_items.stocktake_id', '=', 'stocktakes.id')
                ->join('items', 'stocktake_items.item_id', '=', 'items.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'stocktakes.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('consultation_types.name', 'Pharmacy')
                ->whereDate('stocktakes.created_at', '>=', Carbon::now()->subDays(30))
                ->select(
                    DB::raw('DATE(stocktakes.created_at) as date'),
                    DB::raw('SUM(stocktake_items.quantity) as quantity')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Stock-out from dispensing
            $stockOut = DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->where('items.status', 'Active')
                ->where('consultation_types.name', 'Pharmacy')
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::now()->subDays(30))
                ->select(
                    DB::raw('DATE(patient_payment_cache.created_at) as date'),
                    DB::raw('SUM(patient_payment_cache_items.quantity) as quantity')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return [
                'stock_in' => $stockIn,
                'stock_out' => $stockOut,
            ];
        }, []);

        // List of available frames for the filter dropdown
        $data['statistics']['frame_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Frame')
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->select('items.id', 'items.name')
                ->orderBy('items.name')
                ->get();
        }, []);

        // Monthly sold frames (last 6 months) - optionally filtered by specific frame
        $data['statistics']['frame_monthly_sales'] = $this->safe(function () use ($clinic_id, $frame_id) {
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $dt = Carbon::now()->subMonths($i);
                $label = $dt->format('M Y');
                $year = $dt->year;
                $month = $dt->month;

                $query = DB::table('patient_payment_cache_items')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('users.clinic_id', $clinic_id);
                    })
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->where('items.status', 'Active')
                    ->where('item_types.name', 'Frame')
                    ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                    ->whereYear('patient_payment_cache.created_at', $year)
                    ->whereMonth('patient_payment_cache.created_at', $month);

                // Filter by specific frame if provided
                if ($frame_id) {
                    $query->where('items.id', $frame_id);
                    $total = $query->sum('patient_payment_cache_items.quantity');
                    
                    $months[] = [
                        'label' => $label,
                        'quantity_sold' => (int) $total,
                    ];
                } else {
                    // When showing all frames, get total and identify top product
                    $total = $query->sum('patient_payment_cache_items.quantity');
                    
                    // Get the top selling frame for this month
                    $topProduct = DB::table('patient_payment_cache_items')
                        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                        ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                        ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                        ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                        ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->where('users.clinic_id', $clinic_id);
                        })
                        ->where('patient_payment_cache_items.status', 'Served')
                        ->where('items.status', 'Active')
                        ->where('item_types.name', 'Frame')
                        ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                        ->whereYear('patient_payment_cache.created_at', $year)
                        ->whereMonth('patient_payment_cache.created_at', $month)
                        ->select('items.name', DB::raw('SUM(patient_payment_cache_items.quantity) as total_qty'))
                        ->groupBy('items.id', 'items.name')
                        ->orderBy('total_qty', 'desc')
                        ->first();
                    
                    $months[] = [
                        'label' => $label,
                        'quantity_sold' => (int) $total,
                        'top_product_name' => $topProduct->name ?? null,
                        'top_product_quantity' => (int) ($topProduct->total_qty ?? 0),
                    ];
                }
            }
            return $months;
        }, []);

        // List of available medicines for the filter dropdown
        $data['statistics']['medicine_items'] = $this->safe(function () use ($clinic_id) {
            return DB::table('items')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('item_types.name', 'Pharmaceutical')
                ->where('consultation_types.name', 'Pharmacy')
                ->select('items.id', 'items.name')
                ->orderBy('items.name')
                ->get();
        }, []);

        // Monthly sold medicines (last 6 months) - optionally filtered by specific medicine
        $data['statistics']['medicine_monthly_sales'] = $this->safe(function () use ($clinic_id, $medicine_id) {
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $dt = Carbon::now()->subMonths($i);
                $label = $dt->format('M Y');
                $year = $dt->year;
                $month = $dt->month;

                $query = DB::table('patient_payment_cache_items')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                    ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                    ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                    ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('users.clinic_id', $clinic_id);
                    })
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->where('items.status', 'Active')
                    ->where('item_types.name', 'Pharmaceutical')
                    ->where('consultation_types.name', 'Pharmacy')
                    ->whereYear('patient_payment_cache.created_at', $year)
                    ->whereMonth('patient_payment_cache.created_at', $month);

                // Filter by specific medicine if provided
                if ($medicine_id) {
                    $query->where('items.id', $medicine_id);
                    $total = $query->sum('patient_payment_cache_items.quantity');
                    
                    $months[] = [
                        'label' => $label,
                        'quantity_sold' => (int) $total,
                    ];
                } else {
                    // When showing all medicines, get total and identify top product
                    $total = $query->sum('patient_payment_cache_items.quantity');
                    
                    // Get the top selling medicine for this month
                    $topProduct = DB::table('patient_payment_cache_items')
                        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                        ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                        ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                        ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                        ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->where('users.clinic_id', $clinic_id);
                        })
                        ->where('patient_payment_cache_items.status', 'Served')
                        ->where('items.status', 'Active')
                        ->where('item_types.name', 'Pharmaceutical')
                        ->where('consultation_types.name', 'Pharmacy')
                        ->whereYear('patient_payment_cache.created_at', $year)
                        ->whereMonth('patient_payment_cache.created_at', $month)
                        ->select('items.name', DB::raw('SUM(patient_payment_cache_items.quantity) as total_qty'))
                        ->groupBy('items.id', 'items.name')
                        ->orderBy('total_qty', 'desc')
                        ->first();
                    
                    $months[] = [
                        'label' => $label,
                        'quantity_sold' => (int) $total,
                        'top_product_name' => $topProduct->name ?? null,
                        'top_product_quantity' => (int) ($topProduct->total_qty ?? 0),
                    ];
                }
            }
            return $months;
        }, []);

        // Pharmacy alerts (expired, expiring soon, out of stock)
        $data['statistics']['pharmacy_alerts'] = $this->safe(function () use ($clinic_id) {
            $expired = DB::table('items')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('consultation_types.name', 'Pharmacy')
                ->where('items.has_expiry', 'Yes')
                ->whereNotNull('items.expiry_date')
                ->whereDate('items.expiry_date', '<', Carbon::today())
                ->count();

            $expiringSoon = DB::table('items')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('consultation_types.name', 'Pharmacy')
                ->where('items.has_expiry', 'Yes')
                ->whereNotNull('items.expiry_date')
                ->whereDate('items.expiry_date', '>=', Carbon::today())
                ->whereDate('items.expiry_date', '<=', Carbon::today()->addDays(90))
                ->count();

            $outOfStock = DB::table('items')
                ->join('consultation_types', 'items.consultation_type_id', '=', 'consultation_types.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('items.clinic_id', $clinic_id);
                })
                ->where('items.status', 'Active')
                ->where('items.is_stock_item', 'Yes')
                ->where('consultation_types.name', 'Pharmacy')
                ->where(function($query) {
                    $query->whereRaw('items.balance <= items.minimum_stock AND items.minimum_stock > 0')
                          ->orWhere('items.balance', 0);
                })
                ->count();

            return [
                'expired_count' => $expired,
                'expiring_soon_count' => $expiringSoon,
                'out_of_stock_count' => $outOfStock,
            ];
        }, []);

        // Sold Frames Pie Chart - generate pie chart data for top selling frames
        $data['statistics']['sold_frames_pie_chart'] = $this->safe(function () use ($clinic_id, $frame_id) {
            $topFrames = DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->when($frame_id, function ($query) use ($frame_id) {
                    $query->where('items.id', $frame_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->where('items.status', 'Active')
                ->where('item_types.name', 'Frame')
                ->select('items.name', DB::raw('SUM(patient_payment_cache_items.quantity) as total_quantity'))
                ->groupBy('items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get();

            return $topFrames->map(function($frame) {
                return [
                    'frame_name' => $frame->name,
                    'quantity_sold' => (int) $frame->total_quantity,
                    'percentage' => 0, // Will be calculated in frontend
                ];
            })->toArray();
        }, []);

        // Sold Medicine Pie Chart - generate pie chart data for top selling medicines
        $data['statistics']['sold_medicine_pie_chart'] = $this->safe(function () use ($clinic_id, $medicine_id) {
            $topMedicines = DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->when($medicine_id, function ($query) use ($medicine_id) {
                    $query->where('items.id', $medicine_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->where('items.status', 'Active')
                ->where('item_types.name', 'Pharmaceutical')
                ->select('items.name', DB::raw('SUM(patient_payment_cache_items.quantity) as total_quantity'))
                ->groupBy('items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get();

            return $topMedicines->map(function($medicine) {
                return [
                    'medicine_name' => $medicine->name,
                    'quantity_sold' => (int) $medicine->total_quantity,
                    'percentage' => 0,
                ];
            })->toArray();
        }, []);

        // Top Products Pie Chart - generate pie chart data for top products
        $data['statistics']['top_products_pie_chart'] = $this->safe(function () use ($clinic_id) {
            $topProducts = DB::table('patient_payment_cache_items')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
                ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('users.clinic_id', $clinic_id);
                })
                ->where('patient_payment_cache_items.status', 'Served')
                ->where('items.status', 'Active')
                ->whereDate('patient_payment_cache.created_at', '>=', Carbon::today()->subDays(30))
                ->select('items.name', DB::raw('SUM(patient_payment_cache_items.quantity) as total_quantity'))
                ->groupBy('items.id', 'items.name')
                ->orderBy('total_quantity', 'desc')
                ->limit(10)
                ->get();

            return $topProducts->map(function($product) {
                return [
                    'product_name' => $product->name,
                    'quantity_sold' => (int) $product->total_quantity,
                    'revenue' => (float) ($product->total_quantity * 100), // Approximate revenue
                ];
            })->toArray();
        }, []);

        return $this->sendResponse($data, Response::HTTP_OK, 'Inventory Management Dashboard data retrieved successfully.');
    }
}
