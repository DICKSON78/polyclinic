<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surgery extends Model
{
    use HasFactory;

    protected $fillable = [
        'surgery_no', 'clinic_id', 'patient_id', 'theatre_id', 'admission_id',
        'surgeon_id', 'assistant_surgeon_id', 'anesthesiologist_id', 'scrub_nurse_id',
        'procedure_name', 'procedure_type', 'scheduled_at', 'started_at', 'ended_at',
        'duration_minutes', 'pre_op_diagnosis', 'post_op_diagnosis', 'pre_op_notes',
        'intra_op_notes', 'post_op_notes', 'blood_loss_ml', 'complications', 'outcome',
        'status', 'cancel_reason', 'created_by', 'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime:Y-m-d H:i',
        'started_at' => 'datetime:Y-m-d H:i',
        'ended_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function theatre()
    {
        return $this->belongsTo(OperatingTheatre::class, 'theatre_id');
    }

    public function admission()
    {
        return $this->belongsTo(Admission::class, 'admission_id');
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }

    public function assistantSurgeon()
    {
        return $this->belongsTo(User::class, 'assistant_surgeon_id');
    }

    public function anesthesiologist()
    {
        return $this->belongsTo(User::class, 'anesthesiologist_id');
    }

    public function scrubNurse()
    {
        return $this->belongsTo(User::class, 'scrub_nurse_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notes()
    {
        return $this->hasMany(SurgicalNote::class, 'surgery_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
