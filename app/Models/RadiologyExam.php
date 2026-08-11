<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RadiologyExam extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'code', 'category', 'preparation', 'description',
        'price', 'turnaround_time', 'status',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
