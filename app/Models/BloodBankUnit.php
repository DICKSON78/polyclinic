<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodBankUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_no', 'clinic_id', 'donor_id', 'blood_group', 'rh_factor', 'component_type',
        'donation_date', 'expiry_date', 'volume_ml', 'storage_location', 'status',
        'patient_id', 'reserved_at', 'issued_at', 'discard_reason', 'notes',
    ];

    protected $casts = [
        'donation_date' => 'date:Y-m-d',
        'expiry_date' => 'date:Y-m-d',
        'reserved_at' => 'datetime:Y-m-d H:i',
        'issued_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function donor()
    {
        return $this->belongsTo(BloodDonor::class, 'donor_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function transfusions()
    {
        return $this->hasMany(Transfusion::class, 'unit_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
