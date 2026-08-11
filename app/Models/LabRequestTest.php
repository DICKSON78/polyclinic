<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabRequestTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_request_id', 'lab_test_id', 'status', 'result', 'unit', 'reference_range',
        'is_abnormal', 'interpretation', 'result_entered_at', 'result_entered_by',
    ];

    protected $casts = [
        'is_abnormal' => 'boolean',
        'result_entered_at' => 'datetime:Y-m-d H:i',
    ];

    public function labRequest()
    {
        return $this->belongsTo(LabRequest::class, 'lab_request_id');
    }

    public function labTest()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
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
