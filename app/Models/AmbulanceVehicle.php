<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceVehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_no', 'clinic_id', 'vehicle_type', 'model', 'capacity',
        'driver_name', 'driver_phone', 'attendant_name', 'attendant_phone',
        'status', 'equipment_notes', 'notes',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function trips()
    {
        return $this->hasMany(AmbulanceTrip::class, 'vehicle_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
