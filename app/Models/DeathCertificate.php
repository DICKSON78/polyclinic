<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeathCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'certificate_no', 'clinic_id', 'body_id', 'patient_id',
        'deceased_name', 'gender', 'date_of_birth', 'date_of_death',
        'place_of_death', 'cause_of_death', 'doctor_id', 'issued_at',
        'status', 'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'date_of_death' => 'datetime:Y-m-d H:i',
        'issued_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function body()
    {
        return $this->belongsTo(MortuaryBody::class, 'body_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
