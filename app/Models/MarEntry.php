<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'admission_id', 'patient_id', 'medication_name', 'dose',
        'route', 'scheduled_time', 'status', 'given_at', 'given_by',
        'reason_omitted', 'notes',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime:Y-m-d H:i',
        'given_at' => 'datetime:Y-m-d H:i',
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

    public function givenBy()
    {
        return $this->belongsTo(User::class, 'given_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
