<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_no', 'clinic_id', 'request_id', 'vehicle_id', 'driver_id',
        'attendant_id', 'dispatched_at', 'arrived_at_pickup', 'departed_pickup',
        'arrived_at_destination', 'distance_km', 'fuel_used_litres',
        'overtime_hours', 'trip_report', 'status', 'notes',
    ];

    protected $casts = [
        'dispatched_at' => 'datetime:Y-m-d H:i',
        'arrived_at_pickup' => 'datetime:Y-m-d H:i',
        'departed_pickup' => 'datetime:Y-m-d H:i',
        'arrived_at_destination' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function request()
    {
        return $this->belongsTo(AmbulanceRequest::class, 'request_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(AmbulanceVehicle::class, 'vehicle_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function attendant()
    {
        return $this->belongsTo(User::class, 'attendant_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
