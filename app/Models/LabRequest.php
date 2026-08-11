<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_no', 'clinic_id', 'patient_id', 'consultation_id', 'requested_by',
        'priority', 'status', 'clinical_notes', 'sample_collected_at', 'sample_collected_by',
        'completed_at', 'completed_by', 'cancel_reason',
    ];

    protected $casts = [
        'sample_collected_at' => 'datetime:Y-m-d H:i',
        'completed_at' => 'datetime:Y-m-d H:i',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function sampleCollectedBy()
    {
        return $this->belongsTo(User::class, 'sample_collected_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function tests()
    {
        return $this->hasMany(LabRequestTest::class, 'lab_request_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
