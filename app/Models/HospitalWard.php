<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HospitalWard extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'code', 'ward_type', 'floor',
        'bed_capacity', 'price_per_day', 'description', 'status',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function beds()
    {
        return $this->hasMany(Bed::class, 'hospital_ward_id');
    }

    public function availableBeds()
    {
        return $this->beds()->where('status', 'Available');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
