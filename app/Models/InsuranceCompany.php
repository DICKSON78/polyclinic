<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsuranceCompany extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'code', 'type', 'contact_person', 'phone', 'email', 'address', 'status',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function patient_insurances()
    {
        return $this->hasMany(PatientInsurance::class, 'insurance_company_id');
    }

    public function claims()
    {
        return $this->hasMany(InsuranceClaim::class, 'insurance_company_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
