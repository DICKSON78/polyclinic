<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InpatientCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'admission_id', 'patient_id', 'charge_type', 'description',
        'charge_date', 'unit_price', 'quantity', 'amount', 'charged_by',
        'status', 'billed_at_bill_id', 'voided_at', 'notes',
    ];

    protected $casts = [
        'charge_date' => 'date:Y-m-d',
        'voided_at' => 'datetime:Y-m-d H:i',
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

    public function chargedBy()
    {
        return $this->belongsTo(User::class, 'charged_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
