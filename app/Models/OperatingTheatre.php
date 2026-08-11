<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperatingTheatre extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'location', 'equipment_notes', 'status', 'notes',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function surgeries()
    {
        return $this->hasMany(Surgery::class, 'theatre_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
