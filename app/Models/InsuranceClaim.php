<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsuranceClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_no', 'clinic_id', 'insurance_company_id', 'patient_id', 'check_in_id', 'consultation_id',
        'service_date', 'submitted_date', 'status', 'claim_amount', 'approved_amount', 'paid_amount',
        'reject_reason', 'created_by', 'submitted_by', 'approved_by', 'paid_by',
        'submitted_at', 'approved_at', 'paid_at',
    ];

    protected $casts = [
        'service_date' => 'date',
        'submitted_date' => 'date',
        'submitted_at' => 'datetime:Y-m-d H:i',
        'approved_at' => 'datetime:Y-m-d H:i',
        'paid_at' => 'datetime:Y-m-d H:i',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function insurance_company()
    {
        return $this->belongsTo(InsuranceCompany::class, 'insurance_company_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function check_in()
    {
        return $this->belongsTo(PatientCheckIn::class, 'check_in_id');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    public function items()
    {
        return $this->hasMany(InsuranceClaimItem::class, 'insurance_claim_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
