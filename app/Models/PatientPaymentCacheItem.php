<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientPaymentCacheItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_id', 'item_id', 'medicine_id', 'prescription_id', 'prescription_item_id',
        'consultation_type_id', 'consultant_id', 'payment_mode_id',
        'unit_price', 'quantity', 'item_payment_id', 'bill_id', 'created_by', 'dosage', 'comments', 'status',
        'served_at', 'served_by',
    ];

    protected $casts = [
        'served_at' => 'datetime:Y-m-d H:i',
    ];

    public function payment_cache()
    {
        return $this->belongsTo(PatientPaymentCache::class, 'payment_cache_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    public function prescription()
    {
        return $this->belongsTo(Prescription::class, 'prescription_id');
    }

    public function prescription_item()
    {
        return $this->belongsTo(PrescriptionItem::class, 'prescription_item_id');
    }

    public function consultation_type()
    {
        return $this->belongsTo(ConsultationType::class, 'consultation_type_id');
    }

    public function consultant()
    {
        return $this->belongsTo(User::class, 'consultant_id');
    }

    public function consultation()
    {
        return $this->hasOne(Consultation::class, 'payment_cache_item_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function server()
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
