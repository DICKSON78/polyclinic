<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurgicalNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'surgery_id', 'author_id', 'note_type', 'note',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function surgery()
    {
        return $this->belongsTo(Surgery::class, 'surgery_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
