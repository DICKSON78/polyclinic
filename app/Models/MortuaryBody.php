<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortuaryBody extends Model
{
    use HasFactory;

    protected $fillable = [
        'body_no', 'clinic_id', 'patient_id', 'deceased_name', 'gender',
        'age', 'date_of_death', 'cause_of_death', 'admitted_at',
        'admitted_by', 'storage_location', 'status', 'released_at',
        'released_by', 'received_by_name', 'received_by_phone', 'notes',
    ];

    protected $casts = [
        'date_of_death' => 'datetime:Y-m-d H:i',
        'admitted_at' => 'datetime:Y-m-d H:i',
        'released_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function admittedBy()
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function releasedBy()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function certificate()
    {
        return $this->hasOne(DeathCertificate::class, 'body_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
