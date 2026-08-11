<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfusion extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfusion_no', 'clinic_id', 'patient_id', 'unit_id', 'requested_by',
        'administered_by', 'indication', 'cross_match', 'cross_match_time',
        'started_at', 'ended_at', 'vitals_before', 'vitals_after', 'reaction',
        'reaction_notes', 'outcome', 'status', 'notes',
    ];

    protected $casts = [
        'cross_match_time' => 'datetime:Y-m-d H:i',
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

    public function unit()
    {
        return $this->belongsTo(BloodBankUnit::class, 'unit_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function administeredBy()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
