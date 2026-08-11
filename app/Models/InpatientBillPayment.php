<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InpatientBillPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_id', 'clinic_id', 'amount', 'payment_date', 'payment_mode_id',
        'recorded_by', 'reference', 'notes',
    ];

    protected $casts = [
        'payment_date' => 'date:Y-m-d',
    ];

    public function bill()
    {
        return $this->belongsTo(InpatientBill::class, 'bill_id');
    }

    public function paymentMode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
