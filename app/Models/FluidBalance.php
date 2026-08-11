<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FluidBalance extends Model
{
    use HasFactory;

    protected $appends = ['total_intake', 'total_output', 'net'];

    protected $fillable = [
        'clinic_id', 'admission_id', 'patient_id', 'balance_date', 'shift',
        'intake_oral', 'intake_iv', 'intake_other',
        'output_urine', 'output_drain', 'output_other',
        'recorded_by', 'notes',
    ];

    protected $casts = [
        'balance_date' => 'date:Y-m-d',
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

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getTotalIntakeAttribute()
    {
        return round(
            (float) ($this->intake_oral ?? 0)
            + (float) ($this->intake_iv ?? 0)
            + (float) ($this->intake_other ?? 0),
            2
        );
    }

    public function getTotalOutputAttribute()
    {
        return round(
            (float) ($this->output_urine ?? 0)
            + (float) ($this->output_drain ?? 0)
            + (float) ($this->output_other ?? 0),
            2
        );
    }

    public function getNetAttribute()
    {
        return round($this->total_intake - $this->total_output, 2);
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
