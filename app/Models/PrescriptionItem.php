<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_id', 'medicine_id', 'medicine_name', 'dosage', 'frequency',
        'duration', 'duration_unit', 'quantity', 'unit', 'meal', 'instructions',
        'status', 'dispensed_qty', 'dispensed_at', 'dispensed_by',
    ];

    protected $casts = [
        'quantity' => 'float',
        'dispensed_qty' => 'float',
        'dispensed_at' => 'datetime:Y-m-d H:i',
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class, 'prescription_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    public function dispensedBy()
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
