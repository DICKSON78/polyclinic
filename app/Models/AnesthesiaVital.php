<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnesthesiaVital extends Model
{
    use HasFactory;

    protected $fillable = [
        'anesthesia_record_id', 'recorded_at', 'heart_rate', 'blood_pressure',
        'oxygen_saturation', 'respiratory_rate', 'temperature', 'etco2', 'notes',
    ];

    protected $casts = [
        'recorded_at' => 'datetime:Y-m-d H:i',
    ];

    public function record()
    {
        return $this->belongsTo(AnesthesiaRecord::class, 'anesthesia_record_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
