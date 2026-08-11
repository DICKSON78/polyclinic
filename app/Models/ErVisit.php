<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_no', 'clinic_id', 'patient_id', 'triaged_by', 'doctor_id', 'nurse_id',
        'arrival_time', 'seen_time', 'discharge_time', 'triage_category', 'priority',
        'chief_complaint', 'history', 'assessment', 'diagnosis', 'treatment',
        'disposition', 'admission_id', 'referral_to', 'outcome', 'status', 'notes',
    ];

    protected $casts = [
        'arrival_time' => 'datetime:Y-m-d H:i',
        'seen_time' => 'datetime:Y-m-d H:i',
        'discharge_time' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function triagedBy()
    {
        return $this->belongsTo(User::class, 'triaged_by');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function nurse()
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }

    public function admission()
    {
        return $this->belongsTo(Admission::class, 'admission_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
