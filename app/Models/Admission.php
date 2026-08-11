<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_no', 'clinic_id', 'patient_id', 'hospital_ward_id', 'bed_id',
        'admitted_by', 'doctor_id', 'admission_date', 'admission_reason', 'diagnosis',
        'condition', 'notes', 'discharge_reason', 'discharge_notes', 'discharged_by',
        'discharge_date', 'status',
    ];

    protected $casts = [
        'admission_date' => 'datetime:Y-m-d H:i',
        'discharge_date' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function ward()
    {
        return $this->belongsTo(HospitalWard::class, 'hospital_ward_id');
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class, 'bed_id');
    }

    public function admittedBy()
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function dischargedBy()
    {
        return $this->belongsTo(User::class, 'discharged_by');
    }

    public function notes()
    {
        return $this->hasMany(InpatientNote::class, 'admission_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
