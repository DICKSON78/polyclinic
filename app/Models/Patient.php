<?php

namespace App\Models;

use App\Models\Marketing\InformationSource;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $appends = ['full_name'];

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'gender', 'date_of_birth', 'region_id', 'district_id', 'ward_id',
        'address', 'national_id', 'phone', 'email', 'occupation', 'payment_mode_id', 'info_source_id', 'is_vip', 
        'is_student', 'is_businessperson', 'is_outreach', 'is_employee', 'created_by', 'is_test_user',
    ];

    public function scopeReal($query)
    {
        return $query->where('is_test_user', 0);
    }

    protected $casts = [
        'is_student' => 'boolean',
        'is_businessperson' => 'boolean',
        'is_outreach' => 'boolean',
        'is_employee' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function information_source()
    {
        return $this->belongsTo(InformationSource::class, 'info_source_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function waiting_times()
    {
        return $this->hasMany(PatientWaitingTime::class, 'patient_id');
    }

    public function doctor_tasks()
    {
        return $this->hasMany(DoctorTask::class, 'patient_id');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'id', 'id')
            ->join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
            ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
            ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
            ->where('patient_check_ins.patient_id', $this->getKey())
            ->select('consultations.*');
    }

    public function current_waiting_time()
    {
        return $this->hasOne(PatientWaitingTime::class, 'patient_id')->whereIn('patient_waiting_times.status', ['waiting', 'in_treatment']);
    }

    public function check_ins()
    {
        return $this->hasMany(PatientCheckIn::class, 'patient_id');
    }

    public function vitalSigns()
    {
        return $this->hasMany(VitalSign::class, 'patient_id');
    }

    public function labRequests()
    {
        return $this->hasMany(LabRequest::class, 'patient_id');
    }

    public function labRequestTests()
    {
        return $this->hasManyThrough(LabRequestTest::class, LabRequest::class, 'patient_id', 'lab_request_id', 'id', 'id');
    }

    public function radiologyRequests()
    {
        return $this->hasMany(RadiologyRequest::class, 'patient_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'patient_id');
    }

    public function admissions()
    {
        return $this->hasMany(Admission::class, 'patient_id');
    }

    public function inpatientNotes()
    {
        return $this->hasMany(InpatientNote::class, 'patient_id');
    }

    public function calling_status()
    {
        return $this->hasOne(PatientCallingStatus::class, 'patient_id');
    }

    public function getFullNameAttribute()
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name
        ]);
        return implode(' ', $parts);
    }

    // Mutator to handle both boolean and string input for is_vip
    public function setIsVipAttribute($value)
    {
        if (is_bool($value)) {
            $this->attributes['is_vip'] = $value ? 'Yes' : 'No';
        } elseif (is_numeric($value)) {
            $this->attributes['is_vip'] = (int)$value === 1 ? 'Yes' : 'No';
        } else {
            $this->attributes['is_vip'] = $value === 'Yes' ? 'Yes' : 'No';
        }
    }

    // Custom accessor to properly convert enum 'Yes'/'No' to boolean
    public function getIsVipAttribute($value)
    {
        return $value === 'Yes' || $value === true || $value === 1 || $value === '1';
    }

    public function scopeFullName($query, $value)
    {
        if (empty($value)) {
            return $query;
        }
        // Handle NULL values properly in concat
        return $query->whereRaw(
            'CONCAT(COALESCE(first_name, ""), COALESCE(middle_name, ""), COALESCE(last_name, "")) LIKE ?',
            ['%' . str_replace(' ', '', $value) . '%']
        );
    }

    public function scopeVip($query)
    {
        return $query->where('is_vip', true);
    }

    public function scopeRegular($query)
    {
        return $query->where('is_vip', false);
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}