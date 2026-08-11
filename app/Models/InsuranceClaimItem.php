<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsuranceClaimItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'insurance_claim_id', 'payment_cache_item_id', 'item_id', 'item_name', 'quantity', 'unit_price', 'amount',
    ];

    public function claim()
    {
        return $this->belongsTo(InsuranceClaim::class, 'insurance_claim_id');
    }

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
