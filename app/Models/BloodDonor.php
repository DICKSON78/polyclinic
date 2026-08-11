<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodDonor extends Model
{
    use HasFactory;

    protected $fillable = [
        'donor_no', 'clinic_id', 'first_name', 'last_name', 'phone', 'email',
        'date_of_birth', 'gender', 'blood_group', 'rh_factor', 'national_id',
        'occupation', 'medical_history', 'status', 'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function units()
    {
        return $this->hasMany(BloodBankUnit::class, 'donor_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
