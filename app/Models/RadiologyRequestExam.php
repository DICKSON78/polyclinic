<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RadiologyRequestExam extends Model
{
    use HasFactory;

    protected $fillable = [
        'radiology_request_id', 'radiology_exam_id', 'status', 'findings',
        'impression', 'conclusion', 'result_entered_at', 'result_entered_by',
    ];

    protected $casts = [
        'result_entered_at' => 'datetime:Y-m-d H:i',
    ];

    public function radiologyRequest()
    {
        return $this->belongsTo(RadiologyRequest::class, 'radiology_request_id');
    }

    public function radiologyExam()
    {
        return $this->belongsTo(RadiologyExam::class, 'radiology_exam_id');
    }

    public function resultEnteredBy()
    {
        return $this->belongsTo(User::class, 'result_entered_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
