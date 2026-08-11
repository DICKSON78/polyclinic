<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'patient_direction', 'chief_complaint', 'history_present_illness',
        'family_history', 'general_health',
        // Note: family_ocular_history and family_general_history removed - columns don't exist in database
        'patient_to_return', 'to_return_date', 'return_reason', 'remarks', 'created_by',
        'status', 'require_glass', 'sent_to_optician_at', 'sent_to_optician_by', 'lens_types',
        'doctor_recommendations', 'doctor_comments_remarks', 'optician_completed_at',
        'payment_mode_id', 'consultant_id', 'server_id',
    ];

    protected $casts = [
        'sent_to_optician_at' => 'datetime:Y-m-d H:i',
        'optician_completed_at' => 'datetime:Y-m-d H:i',
        'lens_types' => 'json',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function payment_cache()
    {
        return $this->hasMany(PatientPaymentCache::class, 'consultation_id');
    }

    public function diagnoses()
    {
        return $this->hasMany(ConsultationDiagnosis::class, 'consultation_id');
    }

    public function external_examination()
    {
        return $this->hasOne(ConsultationExternalExamination::class, 'consultation_id');
    }

    public function functional_tests()
    {
        return $this->hasOne(ConsultationFunctionalTest::class, 'consultation_id');
    }

    public function visual_acuity()
    {
        return $this->hasOne(ConsultationVisualAcuity::class, 'consultation_id');
    }

    public function refraction()
    {
        return $this->hasOne(ConsultationRefraction::class, 'consultation_id');
    }

    public function fundoscopy()
    {
        return $this->hasOne(ConsultationFundoscopy::class, 'consultation_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function to_optician_sender()
    {
        return $this->belongsTo(User::class, 'sent_to_optician_by');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function consultant()
    {
        return $this->belongsTo(User::class, 'consultant_id');
    }

    public function server()
    {
        return $this->belongsTo(User::class, 'server_id');
    }

    public function doctor_tasks()
    {
        return $this->hasMany(DoctorTask::class, 'consultation_id');
    }

    /**
     * Get the referrals for the consultation.
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class, 'consultation_id');
    }

    /**
     * Get the latest referral for the consultation.
     */
    public function referral()
    {
        return $this->hasOne(Referral::class, 'consultation_id')->latest();
    }

    /**
     * Get the items for the consultation through payment cache.
     */
    public function items()
    {
        return $this->hasManyThrough(
            PatientPaymentCacheItem::class,
            PatientPaymentCache::class,
            'consultation_id', // Foreign key on payment_cache table
            'payment_cache_id', // Foreign key on patient_payment_cache_items table
            'id', // Local key on consultations table
            'id' // Local key on payment_cache table
        );
    }

    public function lab_requests()
    {
        return $this->hasMany(LabRequest::class, 'consultation_id');
    }

    public function radiology_requests()
    {
        return $this->hasMany(RadiologyRequest::class, 'consultation_id');
    }

    public function vital_signs()
    {
        return $this->hasMany(VitalSign::class, 'consultation_id');
    }



    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
