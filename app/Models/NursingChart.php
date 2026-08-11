<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NursingChart extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'admission_id', 'patient_id', 'chart_date', 'shift',
        'temperature', 'pulse', 'respiration', 'blood_pressure', 'spo2',
        'blood_sugar', 'pain_level', 'nursing_notes', 'observations',
        'recorded_by', 'recorded_at',
    ];

    protected $casts = [
        'chart_date' => 'date:Y-m-d',
        'recorded_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function admission()
    {
        return $this->belongsTo(Admission::class, 'admission_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
