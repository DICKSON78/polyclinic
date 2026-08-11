<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RadiologyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_no', 'clinic_id', 'patient_id', 'consultation_id', 'requested_by',
        'priority', 'status', 'clinical_notes', 'contrast', 'performed_at', 'performed_by',
        'completed_at', 'completed_by', 'cancel_reason',
    ];

    protected $casts = [
        'performed_at' => 'datetime:Y-m-d H:i',
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

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function exams()
    {
        return $this->hasMany(RadiologyRequestExam::class, 'radiology_request_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
