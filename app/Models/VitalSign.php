<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VitalSign extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'consultation_id',
        'triaged_by',
        'temperature',
        'systolic_bp',
        'diastolic_bp',
        'heart_rate',
        'respiratory_rate',
        'oxygen_saturation',
        'weight_kg',
        'height_cm',
        'bmi',
        'blood_group',
        'chief_complaint',
        'triage_category',
        'notes',
    ];

    protected $appends = ['bmi_calculated'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function triagedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triaged_by');
    }

    public function getBmiCalculatedAttribute()
    {
        if ($this->weight_kg && $this->height_cm && $this->height_cm > 0) {
            $heightM = $this->height_cm / 100;
            return round($this->weight_kg / ($heightM * $heightM), 2);
        }
        return null;
    }
}
