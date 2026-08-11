<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class LensStockController extends Controller
{
    use ApiResponse;

    /**
     * Get lens stock with filtering options
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'lens_type' => 'sometimes|string', // 'SV', 'Single Vision', 'Multifocal', etc.
            'lens_type_id' => 'sometimes|integer',
            'sph' => 'sometimes|string', // Sphere value for SV lenses
            'cyl' => 'sometimes|string', // Cylinder value for SV lenses
            'q' => 'sometimes|string', // General search query
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $data = Item::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type', 'prices'])
            ->whereHas('item_type', function ($query) {
                $query->where('name', 'Lens');
            })
            ->whereHas('consultation_type', function ($query) {
                $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
            })
            ->where('status', 'Active');

        if ($clinic_id) {
            $data->where('clinic_id', $clinic_id);
        }

        // Filter by lens type (SV/Single Vision or Multifocal)
        if ($request->lens_type) {
            $lensType = strtolower(trim($request->lens_type));
            if (in_array($lensType, ['sv', 'single vision', 'singlevision'])) {
                $data->whereHas('lens_type', function ($query) {
                    $query->where(DB::raw('LOWER(name)'), 'like', '%single vision%')
                          ->orWhere(DB::raw('LOWER(name)'), 'sv');
                });
            } elseif (in_array($lensType, ['multifocal', 'multi-focal'])) {
                $data->whereHas('lens_type', function ($query) {
                    $query->where(function($q) {
                        $q->where(DB::raw('LOWER(name)'), 'like', '%bifocal%')
                          ->orWhere(DB::raw('LOWER(name)'), 'like', '%progressive%')
                          ->orWhere(DB::raw('LOWER(name)'), 'like', '%multifocal%');
                    });
                });
            } else {
                // Fallback for direct matching if it doesn't match the presets
                $data->whereHas('lens_type', function ($query) use ($lensType) {
                    $query->where(DB::raw('LOWER(name)'), 'like', '%' . $lensType . '%');
                });
            }
        }

        if ($request->lens_type_id) {
            $data->where('lens_type_id', $request->lens_type_id);
        }

        // For SV lenses, search by sphere and cylinder values
        // These might be in the item name, code, or templates field
        if ($request->sph || $request->cyl) {
            $data->where(function ($query) use ($request) {
                // Search in item name
                if ($request->sph) {
                    $query->where(function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->sph . '%')
                          ->orWhere('code', 'like', '%' . $request->sph . '%')
                          ->orWhere('templates', 'like', '%' . $request->sph . '%');
                    });
                }
                
                if ($request->cyl) {
                    $query->where(function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->cyl . '%')
                          ->orWhere('code', 'like', '%' . $request->cyl . '%')
                          ->orWhere('templates', 'like', '%' . $request->cyl . '%');
                    });
                }
            });
        }

        // General search query
        if ($request->q) {
            $data->where(function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->q . '%')
                      ->orWhere('code', 'like', '%' . $request->q . '%')
                      ->orWhere('templates', 'like', '%' . $request->q . '%');
            });
        }

        $data->orderBy('name', 'asc');
        $data = $data->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Lens stock retrieved successfully.');
    }
}

