<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InpatientNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'admission_id', 'patient_id', 'noted_by',
        'note_type', 'note_text', 'noted_at',
    ];

    protected $casts = [
        'noted_at' => 'datetime:Y-m-d H:i',
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

    public function notedBy()
    {
        return $this->belongsTo(User::class, 'noted_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
