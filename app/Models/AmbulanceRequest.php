<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_no', 'clinic_id', 'patient_id', 'requested_by', 'pickup_location',
        'destination', 'pickup_time', 'patient_condition', 'transport_type',
        'special_requirements', 'status', 'notes',
    ];

    protected $casts = [
        'pickup_time' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function trip()
    {
        return $this->hasOne(AmbulanceTrip::class, 'request_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
