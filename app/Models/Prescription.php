<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_no', 'clinic_id', 'patient_id', 'consultation_id', 'prescribed_by',
        'date_prescribed', 'diagnosis', 'clinical_notes', 'status', 'expires_at',
        'cancel_reason', 'cancelled_by', 'cancelled_at',
    ];

    protected $casts = [
        'date_prescribed' => 'datetime:Y-m-d H:i',
        'expires_at' => 'date',
        'cancelled_at' => 'datetime:Y-m-d H:i',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    public function prescribedBy()
    {
        return $this->belongsTo(User::class, 'prescribed_by');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class, 'prescription_id');
    }

    public function bill_items()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'prescription_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
