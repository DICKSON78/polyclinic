<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnesthesiaRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_no', 'clinic_id', 'patient_id', 'surgery_id', 'admission_id',
        'anesthesiologist_id', 'anesthesia_type', 'asa_class', 'airway', 'fasting_hours',
        'allergies', 'pre_op_assessment', 'induction_agent', 'maintenance_agents',
        'reversal_agents', 'iv_fluids_ml', 'blood_transfusion_ml', 'urine_output_ml',
        'blood_loss_ml', 'induction_time', 'emergence_time', 'recovery_time',
        'intraop_complications', 'postop_complications', 'postop_instructions',
        'status', 'created_by', 'notes',
    ];

    protected $casts = [
        'induction_time' => 'datetime:Y-m-d H:i',
        'emergence_time' => 'datetime:Y-m-d H:i',
        'recovery_time' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function surgery()
    {
        return $this->belongsTo(Surgery::class, 'surgery_id');
    }

    public function admission()
    {
        return $this->belongsTo(Admission::class, 'admission_id');
    }

    public function anesthesiologist()
    {
        return $this->belongsTo(User::class, 'anesthesiologist_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function vitals()
    {
        return $this->hasMany(AnesthesiaVital::class, 'anesthesia_record_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
