<?php

namespace Database\Seeders;

use App\Models\PatientCheckIn;
use App\Models\Patient;
use App\Models\PaymentMode;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientItemPayment;
use App\Models\Consultation;
use App\Models\Item;
use App\Models\ConsultationType;
use App\Models\PaymentChannel;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpensePayment;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\LabRequest;
use App\Models\LabRequestTest;
use App\Models\RadiologyRequest;
use App\Models\RadiologyRequestExam;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Admission;
use App\Models\InpatientBill;
use App\Models\InpatientCharge;
use App\Models\ErVisit;
use App\Models\Surgery;
use App\Models\Appointment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SampleTransactionalDataSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        $today = Carbon::today();

        // Get existing data
        $patients = Patient::take(5)->get();
        $paymentMode = PaymentMode::first();
        $paymentChannel = PaymentChannel::first();
        $adminUser = \App\Models\User::where('username', 'admin')->first();
        $doctorUser = \App\Models\User::where('role', 'Doctor')->first();

        if (!$patients->count() || !$paymentMode || !$adminUser) {
            $this->command->warn('Required data not found. Please run DatabaseSeeder first.');
            return;
        }

        // Get consultation items
        $generalConsultationNew = Item::where('name', 'General Consultation - New')->first();
        $generalConsultationReturn = Item::where('name', 'General Consultation - Return')->first();
        $consultationTypeGeneral = ConsultationType::where('name', 'General Consultation')->first();
        $consultationTypePharmacy = ConsultationType::where('name', 'Pharmacy')->first();
        $consultationTypeOthers = ConsultationType::where('name', 'Others')->first();

        if (!$generalConsultationNew) {
            $generalConsultationNew = Item::create([
                'name' => 'General Consultation - New',
                'code' => 'GC-NEW',
                'item_type_id' => 1,
                'consultation_type_id' => $consultationTypeGeneral->id ?? 1,
                'unit_of_measure_id' => null,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 0,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if (!$generalConsultationReturn) {
            $generalConsultationReturn = Item::create([
                'name' => 'General Consultation - Return',
                'code' => 'GC-RET',
                'item_type_id' => 1,
                'consultation_type_id' => $consultationTypeGeneral->id ?? 1,
                'unit_of_measure_id' => null,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 0,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Create pharmacy items
        $paracetamol = Item::where('name', 'Paracetamol 500mg')->first();
        $amoxicillin = Item::where('name', 'Amoxicillin 250mg Capsules')->first();

        // Create optical items (frames, lenses) - use firstOrCreate to avoid duplicates
        $frameItem = Item::firstOrCreate(
            ['code' => 'FRAME-001'],
            [
                'name' => 'Frame - Designer',
                'item_type_id' => 2,
                'consultation_type_id' => $consultationTypeOthers->id ?? 4,
                'unit_of_measure_id' => null,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 50,
                'unit_buying_price' => 30000,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $lensItem = Item::firstOrCreate(
            ['code' => 'LENS-001'],
            [
                'name' => 'Lens - Single Vision',
                'item_type_id' => 2,
                'consultation_type_id' => $consultationTypeOthers->id ?? 4,
                'unit_of_measure_id' => null,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 100,
                'unit_buying_price' => 15000,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // Create expense categories if not exist
        $runningCostCategory = ExpenseCategory::where('name', 'Running Cost')->first();
        if (!$runningCostCategory) {
            $runningCostCategory = ExpenseCategory::create([
                'clinic_id' => 1,
                'name' => 'Running Cost',
                'description' => 'Daily operational expenses',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $improvementCostCategory = ExpenseCategory::where('name', 'Improvement Cost')->first();
        if (!$improvementCostCategory) {
            $improvementCostCategory = ExpenseCategory::create([
                'clinic_id' => 1,
                'name' => 'Improvement Cost',
                'description' => 'Capital expenditures',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Create sample check-ins for today
        foreach ($patients->take(3) as $index => $patient) {
            $checkIn = PatientCheckIn::create([
                'patient_id' => $patient->id,
                'payment_mode_id' => $paymentMode->id,
                'created_at' => $today->copy()->addHours($index * 2),
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            // Create payment cache
            $paymentCache = PatientPaymentCache::create([
                'check_in_id' => $checkIn->id,
                'consultation_id' => null,
                'created_at' => $checkIn->created_at,
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            // Create payment cache item (consultation)
            $isNewConsultation = $index === 0;
            $consultationItem = $isNewConsultation ? $generalConsultationNew : $generalConsultationReturn;
            $consultationPrice = $isNewConsultation ? 15000 : 10000;

            $cacheItem = PatientPaymentCacheItem::create([
                'payment_cache_id' => $paymentCache->id,
                'item_id' => $consultationItem->id,
                'consultation_type_id' => $consultationTypeGeneral->id ?? 1,
                'consultant_id' => $doctorUser->id ?? null,
                'payment_mode_id' => $paymentMode->id,
                'unit_price' => $consultationPrice,
                'quantity' => 1,
                'item_payment_id' => null,
                'bill_id' => null,
                'created_at' => $checkIn->created_at,
                'created_by' => $adminUser->id,
                'status' => 'Pending',
                'served_at' => null,
                'served_by' => null,
                'updated_at' => $now,
            ]);

            // Create payment
            $payment = PatientItemPayment::create([
                'channel_id' => $paymentChannel->id,
                'amount' => $consultationPrice,
                'discount' => 0,
                'created_at' => $checkIn->created_at->addMinutes(5),
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            // Link payment to cache item
            $cacheItem->update([
                'item_payment_id' => $payment->id,
                'status' => 'Paid',
                'served_at' => $checkIn->created_at->addMinutes(10),
                'served_by' => $doctorUser->id ?? $adminUser->id,
            ]);

            // Create consultation
            $consultation = Consultation::create([
                'payment_cache_item_id' => $cacheItem->id,
                'patient_direction' => 'Direct to Doctor',
                'chief_complaint' => $isNewConsultation ? 'Headache and fever' : 'Follow-up checkup',
                'history_present_illness' => 'Patient reports symptoms for 2 days',
                'patient_to_return' => $index === 2 ? 'Yes' : 'No',
                'to_return_date' => $index === 2 ? $today->addDays(7) : null,
                'status' => 'Consulted',
                'require_glass' => 'No',
                'created_at' => $checkIn->created_at->addMinutes(15),
                'created_by' => $doctorUser->id ?? $adminUser->id,
                'updated_at' => $now,
            ]);

            // Add pharmacy items to payment cache
            if ($paracetamol && $index < 2) {
                $pharmacyCacheItem = PatientPaymentCacheItem::create([
                    'payment_cache_id' => $paymentCache->id,
                    'item_id' => $paracetamol->id,
                    'consultation_type_id' => $consultationTypePharmacy->id ?? 2,
                    'consultant_id' => null,
                    'payment_mode_id' => $paymentMode->id,
                    'unit_price' => 5000,
                    'quantity' => 2,
                    'item_payment_id' => null,
                    'bill_id' => null,
                    'created_at' => $checkIn->created_at->addMinutes(20),
                    'created_by' => $adminUser->id,
                    'status' => 'Paid',
                    'served_at' => $checkIn->created_at->addMinutes(25),
                    'served_by' => $adminUser->id,
                    'updated_at' => $now,
                ]);

                $pharmacyPayment = PatientItemPayment::create([
                    'channel_id' => $paymentChannel->id,
                    'amount' => 10000,
                    'discount' => 0,
                    'created_at' => $checkIn->created_at->addMinutes(20),
                    'created_by' => $adminUser->id,
                    'updated_at' => $now,
                ]);

                $pharmacyCacheItem->update(['item_payment_id' => $pharmacyPayment->id]);
            }

            // Add optical items (frames/lenses)
            if ($index === 1) {
                $frameCacheItem = PatientPaymentCacheItem::create([
                    'payment_cache_id' => $paymentCache->id,
                    'item_id' => $frameItem->id,
                    'consultation_type_id' => $consultationTypeOthers->id ?? 4,
                    'consultant_id' => null,
                    'payment_mode_id' => $paymentMode->id,
                    'unit_price' => 50000,
                    'quantity' => 1,
                    'item_payment_id' => null,
                    'bill_id' => null,
                    'created_at' => $checkIn->created_at->addMinutes(30),
                    'created_by' => $adminUser->id,
                    'status' => 'Paid',
                    'served_at' => $checkIn->created_at->addMinutes(35),
                    'served_by' => $adminUser->id,
                    'updated_at' => $now,
                ]);

                $framePayment = PatientItemPayment::create([
                    'channel_id' => $paymentChannel->id,
                    'amount' => 50000,
                    'discount' => 5000,
                    'created_at' => $checkIn->created_at->addMinutes(30),
                    'created_by' => $adminUser->id,
                    'updated_at' => $now,
                ]);

                $frameCacheItem->update(['item_payment_id' => $framePayment->id]);
            }

            $this->command->info("Created check-in, payment, and consultation for patient: {$patient->first_name} {$patient->last_name}");
        }

        // Create pending bills
        foreach ($patients->skip(3)->take(2) as $index => $patient) {
            $checkIn = PatientCheckIn::create([
                'patient_id' => $patient->id,
                'payment_mode_id' => $paymentMode->id,
                'created_at' => $today->copy()->addHours(6 + $index),
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            $paymentCache = PatientPaymentCache::create([
                'check_in_id' => $checkIn->id,
                'consultation_id' => null,
                'created_at' => $checkIn->created_at,
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            $cacheItem = PatientPaymentCacheItem::create([
                'payment_cache_id' => $paymentCache->id,
                'item_id' => $generalConsultationNew->id,
                'consultation_type_id' => $consultationTypeGeneral->id ?? 1,
                'consultant_id' => $doctorUser->id ?? null,
                'payment_mode_id' => $paymentMode->id,
                'unit_price' => 15000,
                'quantity' => 1,
                'item_payment_id' => null,
                'bill_id' => null,
                'created_at' => $checkIn->created_at,
                'created_by' => $adminUser->id,
                'status' => 'Pending',
                'served_at' => null,
                'served_by' => null,
                'updated_at' => $now,
            ]);

            // Create pending bill
            $bill = PatientItemBill::create([
                'amount' => 15000,
                'status' => 'Pending',
                'created_at' => $checkIn->created_at,
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);

            $cacheItem->update(['bill_id' => $bill->id]);

            $this->command->info("Created pending bill for patient: {$patient->first_name} {$patient->last_name}");
        }

        // Create expenses
        $runningExpense = Expense::create([
            'category_id' => $runningCostCategory->id,
            'total_amount' => 25000,
            'description' => 'Office supplies and utilities',
            'expense_date' => $today,
            'created_by' => $adminUser->id,
            'created_at' => $today,
            'updated_at' => $now,
        ]);

        ExpensePayment::create([
            'expense_id' => $runningExpense->id,
            'amount' => 25000,
            'description' => 'Payment for office supplies',
            'created_by' => $adminUser->id,
            'created_at' => $today,
            'updated_at' => $now,
        ]);

        $improvementExpense = Expense::create([
            'category_id' => $improvementCostCategory->id,
            'total_amount' => 100000,
            'description' => 'New equipment purchase',
            'expense_date' => $today,
            'created_by' => $adminUser->id,
            'created_at' => $today,
            'updated_at' => $now,
        ]);

        ExpensePayment::create([
            'expense_id' => $improvementExpense->id,
            'amount' => 100000,
            'description' => 'Payment for new equipment',
            'created_by' => $adminUser->id,
            'created_at' => $today,
            'updated_at' => $now,
        ]);

        // Create web appointments
        foreach ($patients->take(2) as $index => $patient) {
            Appointment::create([
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'email' => $patient->email ?? null,
                'phone' => $patient->phone,
                'preferred_date' => $today->addDays($index + 1),
                'preferred_time' => '09:00',
                'reason' => 'General checkup',
                'message' => 'I would like to schedule an appointment',
                'status' => 'Approved',
                'admin_reply' => 'Your appointment has been approved',
                'replied_by' => $adminUser->id,
                'replied_at' => $today,
                'created_at' => $today,
                'updated_at' => $now,
            ]);
        }

        // Create lab requests
        foreach ($patients->take(2) as $index => $patient) {
            $labRequest = LabRequest::firstOrCreate(
                ['request_no' => 'LAB-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT)],
                [
                    'clinic_id' => 1,
                    'patient_id' => $patient->id,
                    'requested_by' => $doctorUser->id ?? 2,
                    'priority' => 'Routine',
                    'status' => $index === 0 ? 'Completed' : 'Pending',
                    'clinical_notes' => 'Routine blood work',
                    'created_at' => $today->addHours($index),
                    'updated_at' => $now,
                ]
            );

            LabRequestTest::firstOrCreate(
                ['lab_request_id' => $labRequest->id, 'lab_test_id' => 1],
                [
                    'status' => $index === 0 ? 'Completed' : 'Pending',
                    'result' => $index === 0 ? 'Normal' : null,
                    'created_at' => $today->addHours($index),
                    'updated_at' => $now,
                ]
            );
        }

        // Create radiology requests
        RadiologyRequest::firstOrCreate(
            ['request_no' => 'RAD-0001'],
            [
                'clinic_id' => 1,
                'patient_id' => $patients->first()->id,
                'requested_by' => $doctorUser->id ?? 2,
                'priority' => 'Routine',
                'status' => 'Pending',
                'clinical_notes' => 'Chest pain',
                'created_at' => $today,
                'updated_at' => $now,
            ]
        );

        // Create prescriptions
        foreach ($patients->take(2) as $index => $patient) {
            $prescription = Prescription::firstOrCreate(
                ['prescription_no' => 'RX-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT)],
                [
                    'clinic_id' => 1,
                    'patient_id' => $patient->id,
                    'prescribed_by' => $doctorUser->id ?? 2,
                    'date_prescribed' => $today->addHours($index),
                    'diagnosis' => 'Upper respiratory infection',
                    'clinical_notes' => 'Take as directed',
                    'status' => 'Active',
                    'created_at' => $today->addHours($index),
                    'updated_at' => $now,
                ]
            );

            if ($paracetamol) {
                PrescriptionItem::firstOrCreate(
                    ['prescription_id' => $prescription->id, 'medicine_id' => $paracetamol->id],
                    [
                        'dosage' => '500mg',
                        'frequency' => 'TDS',
                        'duration' => '7 days',
                        'quantity' => 21,
                        'instructions' => 'Take after meals',
                        'created_at' => $today->addHours($index),
                        'updated_at' => $now,
                    ]
                );
            }
        }

        // Create ER visits
        ErVisit::firstOrCreate(
            ['visit_no' => 'ER-0001'],
            [
                'clinic_id' => 1,
                'patient_id' => $patients->skip(1)->first()->id,
                'triaged_by' => $adminUser->id,
                'doctor_id' => $doctorUser->id ?? 2,
                'arrival_time' => $today->addHours(3),
                'seen_time' => $today->addHours(3)->addMinutes(30),
                'discharge_time' => $today->addHours(4),
                'triage_category' => 'Urgent',
                'priority' => 'Serious',
                'chief_complaint' => 'Abdominal pain',
                'history' => 'Patient reports abdominal pain for 2 hours',
                'assessment' => 'Acute abdominal pain',
                'diagnosis' => 'Gastritis',
                'treatment' => 'Pain management and observation',
                'disposition' => 'Discharged',
                'outcome' => 'Patient discharged home with medication',
                'status' => 'Discharged',
                'notes' => 'Follow-up in 3 days',
                'created_at' => $today->addHours(3),
                'updated_at' => $now,
            ]
        );

        // Create admissions
        $hospitalWard = \App\Models\HospitalWard::first();
        $bed = \App\Models\Bed::first();

        $admission = Admission::firstOrCreate(
            ['admission_no' => 'ADM-0001'],
            [
                'clinic_id' => 1,
                'patient_id' => $patients->first()->id,
                'hospital_ward_id' => $hospitalWard->id ?? null,
                'bed_id' => $bed->id ?? null,
                'admitted_by' => $doctorUser->id ?? 2,
                'doctor_id' => $doctorUser->id ?? 2,
                'admission_date' => $today,
                'admission_reason' => 'Observation for chest pain',
                'diagnosis' => 'Chest pain - under investigation',
                'condition' => 'Stable',
                'notes' => 'Admitted for observation',
                'status' => 'Admitted',
                'created_at' => $today,
                'updated_at' => $now,
            ]
        );

        // Create inpatient bill
        $inpatientBill = InpatientBill::firstOrCreate(
            ['bill_no' => 'IB-0001'],
            [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $patients->first()->id,
                'amount' => 150000,
                'discount' => 0,
                'total' => 150000,
                'status' => 'Open',
                'issued_at' => $today,
                'issued_by' => $adminUser->id,
                'created_at' => $today,
                'updated_at' => $now,
            ]
        );

        InpatientCharge::firstOrCreate(
            ['admission_id' => $admission->id, 'charge_date' => $today, 'charge_type' => 'Bed Day'],
            [
                'clinic_id' => 1,
                'patient_id' => $patients->first()->id,
                'description' => 'General Ward - 1 day',
                'unit_price' => 15000,
                'quantity' => 1,
                'amount' => 15000,
                'charged_by' => $adminUser->id,
                'status' => 'Billed',
                'billed_at_bill_id' => $inpatientBill->id,
                'created_at' => $today,
                'updated_at' => $now,
            ]
        );

        // Create surgery record
        $surgeryCheckIn = PatientCheckIn::firstOrCreate(
            ['patient_id' => $patients->skip(1)->first()->id, 'created_at' => $today],
            [
                'payment_mode_id' => $paymentMode->id,
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]
        );

        $surgeryPaymentCache = PatientPaymentCache::firstOrCreate(
            ['check_in_id' => $surgeryCheckIn->id],
            [
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]
        );

        $surgeryCacheItem = PatientPaymentCacheItem::firstOrCreate(
            ['payment_cache_id' => $surgeryPaymentCache->id, 'item_id' => $generalConsultationNew->id],
            [
                'consultation_type_id' => $consultationTypeGeneral->id ?? 1,
                'consultant_id' => $doctorUser->id ?? null,
                'payment_mode_id' => $paymentMode->id,
                'unit_price' => 50000,
                'quantity' => 1,
                'created_by' => $adminUser->id,
                'status' => 'Paid',
                'served_at' => $today,
                'served_by' => $adminUser->id,
                'updated_at' => $now,
            ]
        );

        if (!$surgeryCacheItem->item_payment_id) {
            $surgeryPayment = PatientItemPayment::create([
                'channel_id' => $paymentChannel->id,
                'amount' => 50000,
                'discount' => 0,
                'created_at' => $today,
                'created_by' => $adminUser->id,
                'updated_at' => $now,
            ]);
            $surgeryCacheItem->update(['item_payment_id' => $surgeryPayment->id]);
        }

        \App\Models\SurgeryRecordReport::firstOrCreate(
            ['payment_cache_item_id' => $surgeryCacheItem->id],
            [
                'surgeon' => $doctorUser->first_name . ' ' . $doctorUser->last_name ?? 'Dr. John Doe',
                'assistant_surgeon' => 'Dr. Jane Smith',
                'scrub_nurse' => 'Nurse Mary',
                'operation_type' => 'Appendectomy',
                'anaesthesia_type' => 'General',
                'operated_eye' => 'N/A',
                'intraoperative_notes' => 'Procedure completed successfully',
                'postoperative_management' => 'Monitor vitals and provide pain management',
                'status' => 'Saved',
                'created_by' => $doctorUser->id ?? 2,
                'created_at' => $today,
                'saved_at' => $today,
                'saved_by' => $doctorUser->id ?? 2,
                'updated_at' => $now,
            ]
        );

        $this->command->info('Sample transactional data seeded successfully!');
    }
}
