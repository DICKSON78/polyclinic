<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const REPLACEMENTS = [
        'Transition lens' => 'Transition item',
        'Bluecut lens' => 'Bluecut item',
        'Bifocal lens' => 'Bifocal item',
        'Non Photochromatic lens' => 'Non Photochromatic item',
        'Spectacle & Medication' => 'Item & Medication',
    ];

    /**
     * Run the migrations.
     */
    public function up()
    {
        if (!Schema::hasColumn('consultations', 'lens_types')) {
            return;
        }

        $consultations = DB::table('consultations')
            ->whereNotNull('lens_types')
            ->where('lens_types', '!=', '')
            ->get(['id', 'lens_types']);

        foreach ($consultations as $consultation) {
            $values = json_decode($consultation->lens_types, true);
            if (!is_array($values)) {
                continue;
            }

            $updated = array_map(function ($value) {
                return self::REPLACEMENTS[$value] ?? $value;
            }, $values);

            if ($updated !== $values) {
                DB::table('consultations')
                    ->where('id', $consultation->id)
                    ->update(['lens_types' => json_encode(array_values(array_unique($updated)))]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        $reversed = array_flip(self::REPLACEMENTS);

        if (!Schema::hasColumn('consultations', 'lens_types')) {
            return;
        }

        $consultations = DB::table('consultations')
            ->whereNotNull('lens_types')
            ->where('lens_types', '!=', '')
            ->get(['id', 'lens_types']);

        foreach ($consultations as $consultation) {
            $values = json_decode($consultation->lens_types, true);
            if (!is_array($values)) {
                continue;
            }

            $updated = array_map(function ($value) use ($reversed) {
                return $reversed[$value] ?? $value;
            }, $values);

            if ($updated !== $values) {
                DB::table('consultations')
                    ->where('id', $consultation->id)
                    ->update(['lens_types' => json_encode(array_values(array_unique($updated)))]);
            }
        }
    }
};
