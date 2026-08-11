<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InpatientBill extends Model
{
    use HasFactory;

    protected $appends = ['amount_paid'];

    protected $fillable = [
        'bill_no', 'clinic_id', 'admission_id', 'patient_id', 'amount',
        'discount', 'total', 'status', 'issued_at', 'issued_by',
        'settled_at', 'settled_by', 'notes',
    ];

    protected $casts = [
        'issued_at' => 'datetime:Y-m-d H:i',
        'settled_at' => 'datetime:Y-m-d H:i',
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

    public function charges()
    {
        return $this->hasMany(InpatientCharge::class, 'billed_at_bill_id');
    }

    public function payments()
    {
        return $this->hasMany(InpatientBillPayment::class, 'bill_id');
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function settledBy()
    {
        return $this->belongsTo(User::class, 'settled_by');
    }

    public function getAmountPaidAttribute()
    {
        return (float) $this->payments()->sum('amount');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
