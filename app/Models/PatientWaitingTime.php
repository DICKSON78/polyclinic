<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PatientWaitingTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 'registration_time', 'treatment_start_time', 'treatment_end_time',
        'waiting_duration_minutes', 'treatment_duration_minutes', 'status', 'doctor_id',
        'current_department', 'department_history'
    ];

    protected $casts = [
        'registration_time' => 'datetime',
        'treatment_start_time' => 'datetime',
        'treatment_end_time' => 'datetime',
        'department_history' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Auto-calculate waiting duration when treatment starts
    public function startTreatment($doctorId = null)
    {
        $this->treatment_start_time = now();
        $this->status = 'in_treatment';
        if ($doctorId) {
            $this->doctor_id = $doctorId;
        }
        
        if ($this->registration_time) {
            $this->waiting_duration_minutes = $this->registration_time->diffInMinutes($this->treatment_start_time);
        }
        
        $this->save();
    }

    // Ensure waiting duration is calculated
    public function ensureWaitingDurationCalculated()
    {
        if ($this->waiting_duration_minutes === null && $this->registration_time && $this->treatment_start_time) {
            $this->waiting_duration_minutes = $this->registration_time->diffInMinutes($this->treatment_start_time);
            $this->save();
        }
    }

    // Auto-calculate treatment duration when treatment ends
    public function endTreatment()
    {
        $this->treatment_end_time = now();
        $this->status = 'completed';
        
        // Ensure treatment duration is calculated correctly
        if ($this->treatment_start_time) {
            $this->treatment_duration_minutes = $this->treatment_start_time->diffInMinutes($this->treatment_end_time);
        } else {
            // If no treatment start time, set to 0
            $this->treatment_duration_minutes = 0;
        }
        
        // Ensure waiting duration is calculated if not already set
        if ($this->waiting_duration_minutes === null && $this->registration_time && $this->treatment_start_time) {
            $this->waiting_duration_minutes = $this->registration_time->diffInMinutes($this->treatment_start_time);
        }
        
        $this->save();
        
        \Log::info('Patient treatment ended', [
            'patient_id' => $this->patient_id,
            'patient_name' => $this->patient->full_name ?? 'Unknown',
            'treatment_duration_minutes' => $this->treatment_duration_minutes,
            'waiting_duration_minutes' => $this->waiting_duration_minutes,
            'current_department' => $this->current_department
        ]);
    }

    // Move patient to a different department
    public function moveToDepartment($department, $notes = null)
    {
        $previousDepartment = $this->current_department;
        $this->current_department = $department;
        
        // Add to department history
        $history = $this->department_history ?? [];
        $history[] = [
            'department' => $department,
            'moved_at' => now()->toISOString(),
            'notes' => $notes,
            'previous_department' => $previousDepartment
        ];
        
        $this->department_history = $history;
        
        // Ensure the current_department is saved
        $this->save();
        
        // Log the department change for debugging
        \Log::info('Patient moved to department', [
            'patient_id' => $this->patient_id,
            'patient_name' => $this->patient->full_name ?? 'Unknown',
            'from_department' => $previousDepartment,
            'to_department' => $department,
            'notes' => $notes,
            'current_department' => $this->current_department
        ]);
        
        return $this;
    }

    // Update status when patient is checked in
    public function checkIn($department = 'reception')
    {
        $this->current_department = $department;
        $this->moveToDepartment($department, 'Patient checked in');
        return $this;
    }

    // Update status when patient is sent to cashier
    public function sendToCashier()
    {
        $this->moveToDepartment('cashier', 'Patient sent to cashier for payment');
        return $this;
    }

    // Update status when patient is sent to consultation
    public function sendToConsultation()
    {
        // If the patient is still marked as waiting, start treatment now
        if ($this->status === 'waiting') {
            // Preserve existing doctor if already assigned by upstream logic
            $this->startTreatment($this->doctor_id);
        }

        $this->moveToDepartment('consultation', 'Patient sent to consultation room');
        
        // Assign consulting doctor if not already assigned
        if (!$this->doctor_id) {
            $this->assignConsultingDoctor();
        }
        
        return $this;
    }

    // Update status when patient is sent to dispensing
    public function sendToDispensing()
    {
        $this->moveToDepartment('dispensing', 'Patient sent to dispensing');
        return $this;
    }

    // Update status when patient is sent to procedure room
    public function sendToProcedureRoom()
    {
        $this->moveToDepartment('procedure_room', 'Patient sent to procedure room');
        return $this;
    }

    // Update status when patient returns to reception (after payment/billing)
    public function returnToReception($reason = 'Returned to reception')
    {
        $this->moveToDepartment('reception', $reason);
        return $this;
    }

    /**
     * Assign the consulting doctor to the patient based on consultation records
     */
    public function assignConsultingDoctor()
    {
        // First, try to get the doctor from existing consultation records
        $consultation = $this->patient->consultations()
            ->whereDate('consultations.created_at', $this->registration_time->format('Y-m-d'))
            ->with('payment_cache_item.consultant')
            ->first();
        
        if ($consultation && $consultation->payment_cache_item && $consultation->payment_cache_item->consultant_id) {
            $consultant = $consultation->payment_cache_item->consultant;
            if ($consultant) {
                $this->doctor_id = $consultant->id;
                $this->save();
                
                \Log::info('Assigned consulting doctor to patient', [
                    'patient_id' => $this->patient_id,
                    'patient_name' => $this->patient->full_name ?? 'Unknown',
                    'doctor_id' => $consultant->id,
                    'doctor_name' => $consultant->full_name ?? 'Unknown',
                    'consultation_id' => $consultation->id
                ]);
                
                return $consultant;
            }
        }
        
        // If no consultation found or no consultant assigned, try to get from doctor tasks
        $doctorTask = $this->patient->doctor_tasks()
            ->whereDate('assigned_at', $this->registration_time->format('Y-m-d'))
            ->with('doctor')
            ->first();
        
        if ($doctorTask && $doctorTask->doctor) {
            $this->doctor_id = $doctorTask->doctor_id;
            $this->save();
            
            \Log::info('Assigned doctor from doctor task to patient', [
                'patient_id' => $this->patient_id,
                'patient_name' => $this->patient->full_name ?? 'Unknown',
                'doctor_id' => $doctorTask->doctor_id,
                'doctor_name' => $doctorTask->doctor->full_name ?? 'Unknown',
                'task_id' => $doctorTask->id
            ]);
            
            return $doctorTask->doctor;
        }
        
        // If still no doctor found, assign any available doctor as fallback
        $availableDoctor = \App\Models\User::where('designation', 'Doctor')
            ->where('status', 'Active')
            ->orderBy('id')
            ->first();
        
        if ($availableDoctor) {
            $this->doctor_id = $availableDoctor->id;
            $this->save();
            
            \Log::info('Fallback: Auto-assigned available doctor to patient', [
                'patient_id' => $this->patient_id,
                'patient_name' => $this->patient->full_name ?? 'Unknown',
                'doctor_id' => $availableDoctor->id,
                'doctor_name' => $availableDoctor->full_name ?? 'Unknown'
            ]);
            
            return $availableDoctor;
        }
        
        \Log::warning('No doctor found for patient - no consultation, doctor task, or available doctor', [
            'patient_id' => $this->patient_id,
            'patient_name' => $this->patient->full_name ?? 'Unknown'
        ]);
        
        return null;
    }

    // Get current waiting time in real-time
    public function getCurrentWaitingTimeAttribute()
    {
        if ($this->status === 'waiting' && $this->registration_time) {
            return $this->registration_time->diffInMinutes(now());
        }
        
        // If waiting_duration_minutes is null, calculate it from registration and treatment times
        if ($this->waiting_duration_minutes === null && $this->registration_time && $this->treatment_start_time) {
            $this->waiting_duration_minutes = $this->registration_time->diffInMinutes($this->treatment_start_time);
            $this->save();
        }
        
        return $this->waiting_duration_minutes ?? 0;
    }

    // Get current treatment time in real-time
    public function getCurrentTreatmentTimeAttribute()
    {
        if ($this->status === 'in_treatment' && $this->treatment_start_time) {
            return $this->treatment_start_time->diffInMinutes(now());
        }
        return $this->treatment_duration_minutes;
    }

    // Get total time spent in current department
    public function getCurrentDepartmentTimeAttribute()
    {
        if (!$this->current_department || !$this->department_history) {
            return 0;
        }
        
        $currentEntry = collect($this->department_history)
            ->where('department', $this->current_department)
            ->last();
            
        if ($currentEntry) {
            // For completed patients, calculate time to treatment end
            if ($this->status === 'completed' && $this->treatment_end_time) {
                return Carbon::parse($currentEntry['moved_at'])->diffInMinutes($this->treatment_end_time);
            }
            // For active patients, calculate time to now
            return Carbon::parse($currentEntry['moved_at'])->diffInMinutes(now());
        }
        
        return 0;
    }

    // Check if treatment should be completed based on consultation and items status
    public function shouldCompleteTreatment()
    {
        $consultation = $this->patient->consultations()
            ->whereDate('consultations.created_at', $this->registration_time->format('Y-m-d'))
            ->first();
        
        // If patient has a consultation that is not completed, treatment should continue
        if ($consultation && $consultation->status !== 'Consulted') {
            return false;
        }
        
        // If no consultation, check for direct dispensing
        if (!$consultation) {
            $checkIn = $this->patient->check_ins()
                ->whereDate('created_at', $this->registration_time->format('Y-m-d'))
                ->first();
            
            if ($checkIn && $checkIn->payment_cache) {
                $pendingItems = $checkIn->payment_cache->items()
                    ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                    ->count();
                return $pendingItems === 0;
            }
            return false;
        }
        
        // For consultations, check if items are served (even if consultation status is not 'Consulted')
        if ($consultation->payment_cache_item && $consultation->payment_cache_item->payment_cache) {
            $paymentCache = $consultation->payment_cache_item->payment_cache;
            $pendingItems = $paymentCache->items()
                ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                ->count();
            
            // If all items are served, treatment can be completed regardless of consultation status
            if ($pendingItems === 0) {
                return true;
            }
        }
        
        // Fallback: require consultation to be 'Consulted' if there are pending items
        return $consultation->status === 'Consulted';
    }

        // Check if patient has completed their full treatment journey
    public function hasCompletedFullJourney()
    {
        // Get the patient's consultation
        $consultation = $this->patient->consultations()
            ->whereDate('consultations.created_at', $this->registration_time->format('Y-m-d'))
            ->first();
        
        // Check if patient has items to dispense (either through consultation or direct dispensing)
        $hasItems = false;
        $pendingItems = 0;
        $paymentCache = null;
        
        if ($consultation && $consultation->payment_cache_item && $consultation->payment_cache_item->payment_cache) {
            // Patient has consultation with items
            $paymentCache = $consultation->payment_cache_item->payment_cache;
            $pendingItems = $paymentCache->items()
                ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                ->count();
            $hasItems = $paymentCache->items()->count() > 0;
        } else {
            // Check for direct dispensing (no consultation)
            $checkIn = $this->patient->check_ins()
                ->whereDate('created_at', $this->registration_time->format('Y-m-d'))
                ->first();
            
            if ($checkIn && $checkIn->payment_cache) {
                $paymentCache = $checkIn->payment_cache;
                $pendingItems = $paymentCache->items()
                    ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                    ->count();
                $hasItems = $checkIn->payment_cache->items()->count() > 0;
            }
        }
        
        // SIMPLIFIED LOGIC: If no items to dispense, treatment is complete
        if (!$hasItems) {
            \Log::info('Journey complete - no items to dispense', [
                'patient_id' => $this->patient_id,
                'has_consultation' => $consultation ? 'Yes' : 'No',
                'consultation_status' => $consultation ? $consultation->status : 'No consultation'
            ]);
            return true;
        }
        
        // If there are still pending items, treatment should continue
        if ($pendingItems > 0) {
            \Log::info('Journey not complete - items still pending', [
                'patient_id' => $this->patient_id,
                'pending_items' => $pendingItems,
                'has_consultation' => $consultation ? 'Yes' : 'No'
            ]);
            return false;
        }
        
        // At this point: all items are served/paid
        // Determine required departments based on item types
        $requiresDispensing = false;
        $requiresProcedureRoom = false;

        if ($paymentCache) {
            // Any outpatient item (non-Pharmacy, non-Procedure) implies dispensing step
            $outpatientCount = $paymentCache->items()
                ->whereHas('consultation_type', function($q){ $q->whereNotIn('name', ['Pharmacy', 'Procedure']); })
                ->count();
            $requiresDispensing = $outpatientCount > 0;

            // Pharmacy items also imply dispensing step
            $pharmacyCount = $paymentCache->items()
                ->whereHas('consultation_type', function($q){ $q->where('name', 'Pharmacy'); })
                ->count();
            $requiresDispensing = $requiresDispensing || $pharmacyCount > 0;

            // Procedure items imply procedure room step
            $procedureCount = $paymentCache->items()
                ->whereHas('consultation_type', function($q){ $q->where('name', 'Procedure'); })
                ->count();
            $requiresProcedureRoom = $procedureCount > 0;
        }

        // Enforce department visits for required steps
        if ($requiresDispensing && !$this->hasBeenToDepartment('dispensing')) {
            \Log::info('Journey not complete - dispensing step required but not visited', [
                'patient_id' => $this->patient_id,
                'current_department' => $this->current_department
            ]);
            return false;
        }

        if ($requiresProcedureRoom && !$this->hasBeenToDepartment('procedure_room')) {
            \Log::info('Journey not complete - procedure room step required but not visited', [
                'patient_id' => $this->patient_id,
                'current_department' => $this->current_department
            ]);
            return false;
        }

        // If reached here: no pending items and required steps (if any) have been visited
        \Log::info('Journey complete - no pending items and required steps done', [
            'patient_id' => $this->patient_id,
            'current_department' => $this->current_department,
        ]);
        return true;
        
        // If we reach here, patient is still in treatment
        \Log::info('Journey not complete - patient still in treatment', [
            'patient_id' => $this->patient_id,
            'current_department' => $this->current_department,
            'consultation_status' => $consultation ? $consultation->status : 'No consultation',
            'pending_items' => $pendingItems,
            'has_consultation' => $consultation ? 'Yes' : 'No'
        ]);
        
        return false;
    }

    // Check if patient has been to a specific department
    public function hasBeenToDepartment($department)
    {
        if (!$this->department_history) {
            return false;
        }
        
        return collect($this->department_history)
            ->where('department', $department)
            ->count() > 0;
    }

    // Auto-complete treatment if conditions are met
    public function autoCompleteIfReady()
    {
        if ($this->shouldCompleteTreatment() && $this->status === 'in_treatment') {
            $this->endTreatment();
            return true;
        }
        return false;
    }
    
    // Auto-complete stuck patients (in treatment for too long)
    public function autoCompleteIfStuck()
    {
        // If patient has been in treatment for more than 8 hours, force complete
        if ($this->status === 'in_treatment' && $this->treatment_start_time) {
            $hoursInTreatment = $this->treatment_start_time->diffInHours(now());
            
            if ($hoursInTreatment > 8) {
                \Log::info('Auto-completing stuck patient', [
                    'patient_id' => $this->patient_id,
                    'patient_name' => $this->patient->full_name ?? 'Unknown',
                    'hours_in_treatment' => $hoursInTreatment,
                    'current_department' => $this->current_department
                ]);
                
                $this->endTreatment();
                return true;
            }
        }
        
        return false;
    }

    // Auto-complete patients who have been waiting too long
    public function autoCompleteIfWaitingTooLong()
    {
        if ($this->status === 'waiting' && $this->registration_time) {
            $waitingHours = $this->registration_time->diffInHours(now());
            
            // If patient has been waiting for more than 4 hours, auto-complete them
            if ($waitingHours > 4) {
                \Log::info('Auto-completing stuck waiting patient', [
                    'patient_id' => $this->patient_id,
                    'patient_name' => $this->patient->full_name ?? 'Unknown',
                    'waiting_hours' => $waitingHours,
                    'current_department' => $this->current_department
                ]);
                
                $this->endTreatment();
                return true;
            }
        }
        
        return false;
    }

    // Force complete treatment (for cases where journey logic might be too strict)
    public function forceCompleteTreatment($reason = 'Manually completed')
    {
        if ($this->status === 'in_treatment') {
            \Log::info('Force completing treatment', [
                'patient_id' => $this->patient_id,
                'patient_name' => $this->patient->full_name ?? 'Unknown',
                'reason' => $reason,
                'current_department' => $this->current_department,
                'department_history' => $this->department_history
            ]);
            
            $this->endTreatment();
            return true;
        }
        return false;
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopeInTreatment($query)
    {
        return $query->where('status', 'in_treatment');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('current_department', $department);
    }
}