<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardDataSeeder extends Seeder
{
    private $now;
    private $today;

    public function run()
    {
        $this->now = Carbon::now();
        $this->today = $this->now->toDateString();

        $this->fixReferenceData();

        if (!$this->hasRequiredData()) {
            $this->command->warn('Required data not found (doctors, cashiers, patients or diseases). Please run DatabaseSeeder first.');
            return;
        }

        DB::transaction(function () {
            $this->cleanup();
            $this->seedPatientTransactions();
            $this->seedClinicalDepartments();
            $this->seedSupportDepartments();
            $this->seedFinance();
            $this->seedMisc();
        });

        $this->command->info('DashboardDataSeeder complete.');
    }

    private function hasRequiredData()
    {
        return DB::table('users')->where('role', 'Doctor')->count() > 0
            && DB::table('users')->where('role', 'Cashier')->count() > 0
            && DB::table('patients')->count() > 0
            && DB::table('diseases')->count() > 0
            && DB::table('items')->whereIn('name', ['General Consultation - New', 'General Consultation - Return'])->count() > 0;
    }

    private function pick(array $array)
    {
        return $array ? $array[array_rand($array)] : null;
    }

    private function ensureItem($name, array $extra = [])
    {
        $id = DB::table('items')->where('name', $name)->value('id');
        if (!$id) {
            $id = DB::table('items')->insertGetId(array_merge([
                'name' => $name,
                'status' => 'Active',
                'created_at' => $this->now,
                'updated_at' => $this->now,
            ], $extra));
        }
        return $id;
    }

    private function cleanup()
    {
        // Clinical/support tables carry unique codes with seeder-owned prefixes.
        DB::table('lab_request_tests')->whereIn('lab_request_id', function ($q) {
            $q->select('id')->from('lab_requests')->where('request_no', 'like', 'LAB-D%');
        })->delete();
        DB::table('lab_requests')->where('request_no', 'like', 'LAB-D%')->delete();
        DB::table('radiology_requests')->where('request_no', 'like', 'RAD-D%')->delete();
        DB::table('prescriptions')->where('prescription_no', 'like', 'RX-D%')->delete();
        DB::table('er_visits')->where('visit_no', 'like', 'ER-D%')->delete();
        DB::table('blood_bank_units')->where('unit_no', 'like', 'UNIT-D%')->delete();
        DB::table('blood_donors')->where('donor_no', 'like', 'DNR-D%')->delete();
        DB::table('admissions')->where('admission_no', 'like', 'ADM-D%')->delete();
        DB::table('surgeries')->where('surgery_no', 'like', 'SUR-D%')->delete();
        DB::table('mortuary_bodies')->where('body_no', 'like', 'BDY-D%')->delete();
        DB::table('inpatient_bills')->where('bill_no', 'like', 'IB-D%')->delete();
        DB::table('ambulance_trips')->where('trip_no', 'like', 'TRIP-D%')->delete();
        DB::table('ambulance_requests')->where('request_no', 'like', 'AMB-D%')->delete();

        // Patient transactions cascade from the ppci marker.
        $ppciIds = DB::table('patient_payment_cache_items')->where('comments', 'DASHBOARD_SEED')->pluck('id')->all();
        if ($ppciIds) {
            $consultIds = DB::table('consultations')->whereIn('payment_cache_item_id', $ppciIds)->pluck('id')->all();
            if ($consultIds) {
                DB::table('consultation_diagnoses')->whereIn('consultation_id', $consultIds)->delete();
                DB::table('consultations')->whereIn('id', $consultIds)->delete();
            }
            $cacheIds = DB::table('patient_payment_cache_items')->whereIn('id', $ppciIds)->pluck('payment_cache_id')->unique()->all();
            $payIds = DB::table('patient_payment_cache_items')->whereIn('id', $ppciIds)->pluck('item_payment_id')->unique()->all();
            $checkInIds = $cacheIds ? DB::table('patient_payment_cache')->whereIn('id', $cacheIds)->pluck('check_in_id')->all() : [];
            DB::table('patient_payment_cache_items')->whereIn('id', $ppciIds)->delete();
            if ($cacheIds) {
                DB::table('patient_payment_cache')->whereIn('id', $cacheIds)->delete();
            }
            if ($payIds) {
                DB::table('patient_item_payments')->whereIn('id', $payIds)->delete();
            }
            if ($checkInIds) {
                DB::table('patient_check_ins')->whereIn('id', $checkInIds)->delete();
            }
        }

        // New patients registered by the seeder (email marker) and their check-ins.
        $patientIds = DB::table('patients')->where('email', 'like', '%@polyclinic.local')->pluck('id')->all();
        if ($patientIds) {
            DB::table('patient_check_ins')->whereIn('patient_id', $patientIds)->delete();
            DB::table('patients')->whereIn('id', $patientIds)->delete();
        }

        // Finance rows.
        $expenseIds = DB::table('expenses')->where('description', 'like', 'Expense (Dashboard seed)%')->pluck('id')->all();
        if ($expenseIds) {
            DB::table('expense_payments')->whereIn('expense_id', $expenseIds)->delete();
            DB::table('expenses')->whereIn('id', $expenseIds)->delete();
        }

        // Web appointments (admin reply marker), waiting times (unique statuses) and pending bills (today).
        DB::table('appointments')->where('admin_reply', 'DASHBOARD_SEED_CONFIRMED')->delete();
        DB::table('patient_waiting_times')->whereIn('status', ['waiting', 'in_treatment'])->delete();
        DB::table('patient_item_bills')->where('status', 'Pending')
            ->whereNull('cleared_at')
            ->where('created_at', '>=', $this->today . ' 00:00:00')
            ->delete();
    }

    private function fixReferenceData()
    {
        // consultation_types used by dashboards (name based lookups)
        $others = DB::table('consultation_types')->where('name', 'Others')->value('id');
        if (!$others) {
            $specialist = DB::table('consultation_types')->where('name', 'Specialist')->value('id');
            if ($specialist) {
                DB::table('consultation_types')->where('id', $specialist)->update(['name' => 'Others']);
                $others = $specialist;
            } else {
                $others = DB::table('consultation_types')->insertGetId(['name' => 'Others', 'created_at' => $this->now, 'updated_at' => $this->now]);
            }
        }
        foreach (['Pharmacy', 'Procedure'] as $name) {
            if (!DB::table('consultation_types')->where('name', $name)->exists()) {
                DB::table('consultation_types')->insert(['name' => $name, 'created_at' => $this->now, 'updated_at' => $this->now]);
            }
        }

        // item_types: frame sales are looked up by item_type_id = 4 (currently 'Radiology' with no items)
        DB::table('item_types')->where('id', 4)->update(['name' => 'Frame']);
        $lensTypeId = DB::table('item_types')->where('name', 'Lens')->value('id');
        if (!$lensTypeId) {
            $lensTypeId = DB::table('item_types')->insertGetId(['name' => 'Lens', 'created_at' => $this->now, 'updated_at' => $this->now]);
        }

        // Point the existing frame/lens items at the right item types
        DB::table('items')->where('name', 'Frame - Designer')->update(['item_type_id' => 4]);
        DB::table('items')->whereIn('name', ['Lens - Single Vision', 'Single Vision Lens', 'Progressive Lens'])
            ->update(['item_type_id' => $lensTypeId]);

        // Ensure essential saleable items exist (fresh installations may lack them)
        $serviceTypeId = DB::table('item_types')->where('name', 'Service')->value('id') ?: 1;
        $pharmacyTypeId = DB::table('item_types')->where('name', 'Pharmaceutical')->value('id') ?: 2;
        $generalId = DB::table('consultation_types')->where('name', 'General Consultation')->value('id');

        $this->ensureItem('General Consultation - New', [
            'code' => 'GC-NEW', 'item_type_id' => $serviceTypeId, 'consultation_type_id' => $generalId,
            'is_consultation_item' => 'Yes', 'is_stock_item' => 'No', 'unit_buying_price' => 0,
        ]);
        $this->ensureItem('General Consultation - Return', [
            'code' => 'GC-RET', 'item_type_id' => $serviceTypeId, 'consultation_type_id' => $generalId,
            'is_consultation_item' => 'Yes', 'is_stock_item' => 'No', 'unit_buying_price' => 0,
        ]);

        $frameItemId = DB::table('items')->where('name', 'Frame - Designer')->value('id');
        if (!$frameItemId) {
            $this->ensureItem('Frame - Designer', [
                'code' => 'FRAME-001', 'item_type_id' => 4, 'consultation_type_id' => $others,
                'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 50, 'unit_buying_price' => 30000,
            ]);
        }
        DB::table('items')->where('name', 'Frame - Designer')->update(['item_type_id' => 4]);

        $lensItemId = DB::table('items')->where('name', 'like', '%Lens%')->value('id');
        if (!$lensItemId) {
            $this->ensureItem('Lens - Single Vision', [
                'code' => 'LENS-001', 'item_type_id' => $lensTypeId, 'consultation_type_id' => $others,
                'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 100, 'unit_buying_price' => 15000,
            ]);
        }
        DB::table('items')->where('name', 'Lens - Single Vision')->update(['item_type_id' => $lensTypeId]);

        if (DB::table('items')->where('item_type_id', $pharmacyTypeId)->count() === 0) {
            DB::table('items')->insert([
                ['name' => 'Paracetamol 500mg', 'code' => 'PARA500', 'item_type_id' => $pharmacyTypeId, 'consultation_type_id' => $generalId,
                    'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 500, 'unit_buying_price' => 50, 'status' => 'Active',
                    'created_at' => $this->now, 'updated_at' => $this->now],
                ['name' => 'Amoxicillin 250mg Capsules', 'code' => 'AMOX250', 'item_type_id' => $pharmacyTypeId, 'consultation_type_id' => $generalId,
                    'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 300, 'unit_buying_price' => 80, 'status' => 'Active',
                    'created_at' => $this->now, 'updated_at' => $this->now],
            ]);
        }
    }

    private function seedPatientTransactions()
    {
        $othersId = DB::table('consultation_types')->where('name', 'Others')->value('id');
        $pharmacyId = DB::table('consultation_types')->where('name', 'Pharmacy')->value('id');
        $procedureId = DB::table('consultation_types')->where('name', 'Procedure')->value('id');
        $generalId = DB::table('consultation_types')->where('name', 'General Consultation')->value('id');

        $cashMode = DB::table('payment_modes')->where('name', 'Cash')->value('id') ?: 1;
        $cashChannel = DB::table('payment_channels')->where('name', 'Cash')->value('id') ?: 1;

        $doctorIds = DB::table('users')->where('role', 'Doctor')->pluck('id')->all();
        $cashierIds = DB::table('users')->where('role', 'Cashier')->pluck('id')->all();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $diseaseIds = DB::table('diseases')->pluck('id')->all();
        $pharmacyItemIds = DB::table('items')->where('item_type_id', 2)->pluck('id')->all();
        $lensItemIds = DB::table('items')->where('name', 'LIKE', '%Lens%')->pluck('id')->all();
        $frameItemId = DB::table('items')->where('item_type_id', 4)->value('id');
        $procedureItemIds = DB::table('items')->whereIn('name', ['Gauze Roll', 'Alcohol Swabs', 'Surgical Gloves (Box)'])->pluck('id')->all();

        $consultNewId = DB::table('items')->where('name', 'General Consultation - New')->value('id');
        $consultReturnId = DB::table('items')->where('name', 'General Consultation - Return')->value('id');
        $consultItemIds = array_values(array_filter([$consultNewId, $consultReturnId]));

        // Visit compositions (12 visits today)
        $compositions = [];
        for ($i = 0; $i < 12; $i++) {
            $pharmacy = [['item_id' => $this->pick($pharmacyItemIds), 'unit_price' => rand(2000, 8000), 'quantity' => rand(1, 2), 'consultation_type_id' => $pharmacyId]];
            switch ($i % 5) {
                case 0:
                    $items = array_merge([['item_id' => $consultNewId, 'unit_price' => 10000, 'quantity' => 1, 'consultation_type_id' => $othersId]], $pharmacy);
                    break;
                case 1:
                    $items = array_merge([['item_id' => $consultReturnId, 'unit_price' => 7000, 'quantity' => 1, 'consultation_type_id' => $othersId]], $pharmacy);
                    $items[] = ['item_id' => $this->pick($lensItemIds), 'unit_price' => rand(20000, 35000), 'quantity' => 1, 'consultation_type_id' => $generalId];
                    break;
                case 2:
                    $items = array_merge([['item_id' => $consultNewId, 'unit_price' => 10000, 'quantity' => 1, 'consultation_type_id' => $othersId]], $pharmacy);
                    $items[] = ['item_id' => $frameItemId, 'unit_price' => rand(45000, 70000), 'quantity' => 1, 'consultation_type_id' => $generalId];
                    break;
                case 3:
                    $items = array_merge([['item_id' => $consultReturnId, 'unit_price' => 7000, 'quantity' => 1, 'consultation_type_id' => $othersId]], $pharmacy);
                    $items[] = ['item_id' => $this->pick($procedureItemIds), 'unit_price' => rand(8000, 15000), 'quantity' => 1, 'consultation_type_id' => $procedureId];
                    break;
                case 4:
                    $items = array_merge([['item_id' => $consultNewId, 'unit_price' => 10000, 'quantity' => 1, 'consultation_type_id' => $othersId]], $pharmacy);
                    $items[] = ['item_id' => $this->pick($lensItemIds), 'unit_price' => rand(20000, 35000), 'quantity' => 1, 'consultation_type_id' => $generalId];
                    $items[] = ['item_id' => $frameItemId, 'unit_price' => rand(45000, 70000), 'quantity' => 1, 'consultation_type_id' => $generalId];
                    break;
            }
            $compositions[] = array_values(array_filter($items, function ($it) {
                return $it['item_id'] !== null;
            }));
        }

        foreach ($compositions as $i => $items) {
            $createdAt = Carbon::parse($this->today)->addHours(8 + ($i % 8))->addMinutes(rand(0, 55))->second(0);
            $ts = $createdAt->toDateTimeString();
            $cashier = $this->pick($cashierIds);

            $checkInId = DB::table('patient_check_ins')->insertGetId([
                'patient_id' => $this->pick($patientIds),
                'payment_mode_id' => $cashMode,
                'mode' => 'checkin',
                'created_by' => $cashier,
                'created_at' => $ts,
                'updated_at' => $ts,
            ]);

            $cacheId = DB::table('patient_payment_cache')->insertGetId([
                'check_in_id' => $checkInId,
                'consultation_id' => null,
                'created_by' => $cashier,
                'created_at' => $ts,
                'updated_at' => $ts,
            ]);

            $ppciIds = [];
            foreach ($items as $item) {
                $ppciIds[] = DB::table('patient_payment_cache_items')->insertGetId([
                    'payment_cache_id' => $cacheId,
                    'item_id' => $item['item_id'],
                    'medicine_id' => null,
                    'prescription_id' => null,
                    'prescription_item_id' => null,
                    'consultation_type_id' => $item['consultation_type_id'],
                    'consultant_id' => $this->pick($doctorIds),
                    'payment_mode_id' => $cashMode,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'item_payment_id' => null,
                    'bill_id' => null,
                    'created_by' => $cashier,
                    'dosage' => null,
                    'comments' => 'DASHBOARD_SEED',
                    'status' => 'Served',
                    'served_at' => $ts,
                    'served_by' => $cashier,
                    'created_at' => $ts,
                    'updated_at' => $ts,
                ]);
            }

            $total = array_sum(array_map(function ($x) {
                return $x['unit_price'] * $x['quantity'];
            }, $items));
            $discount = ($i === 2) ? 5000 : 0;

            $paymentId = DB::table('patient_item_payments')->insertGetId([
                'channel_id' => $cashChannel,
                'amount' => $total,
                'discount' => $discount,
                'created_by' => $cashier,
                'created_at' => $ts,
                'updated_at' => $ts,
            ]);
            DB::table('patient_payment_cache_items')->whereIn('id', $ppciIds)->update(['item_payment_id' => $paymentId]);

            // Consultation for the consultation item in this visit
            $consultItemKey = null;
            foreach ($items as $idx => $item) {
                if (in_array($item['item_id'], $consultItemIds)) {
                    $consultItemKey = $idx;
                    break;
                }
            }
            if ($consultItemKey !== null) {
                $doctor = $this->pick($doctorIds);
                $status = ($i % 4 === 3) ? 'Pending' : 'Consulted';
                $consultationId = DB::table('consultations')->insertGetId([
                    'payment_cache_item_id' => $ppciIds[$consultItemKey],
                    'patient_direction' => 'Direct to Doctor',
                    'chief_complaint' => ['Headache', 'Fever', 'Cough', 'Abdominal pain', 'Blurred vision', 'Body weakness'][$i % 6],
                    'history_present_illness' => 'Patient presents with the above complaint for the past few days.',
                    'family_history' => null,
                    'general_health' => 'Generally good health.',
                    'family_ocular_history' => null,
                    'family_general_history' => null,
                    'pupils' => 'Equal and reactive to light.',
                    'extra_ocular_muscles' => 'Full and conjugate.',
                    'patient_to_return' => $i % 3 === 0 ? 'Yes' : 'No',
                    'to_return_date' => $i % 3 === 0 ? Carbon::parse($this->today)->addDays(rand(7, 30))->toDateString() : null,
                    'return_reason' => null,
                    'remarks' => $status === 'Consulted' ? 'Reviewed and advised accordingly.' : null,
                    'doctor_recommendations' => 'Continue prescribed medication and return for review.',
                    'doctor_comments_remarks' => null,
                    'created_at' => $ts,
                    'created_by' => $doctor,
                    'status' => $status,
                    'require_glass' => in_array($items[$consultItemKey]['item_id'], $consultItemIds) && ($i % 4 === 1 || $i % 4 === 4) ? 'Yes' : 'No',
                    'lens_types' => null,
                    'sent_to_optician_at' => null,
                    'sent_to_optician_by' => null,
                    'optician_completed_at' => null,
                    'updated_at' => $ts,
                ]);

                if ($status === 'Consulted') {
                    DB::table('patient_payment_cache')->where('id', $cacheId)->update(['consultation_id' => $consultationId]);
                    $diagnosisCount = rand(1, 2);
                    for ($d = 0; $d < $diagnosisCount; $d++) {
                        DB::table('consultation_diagnoses')->insert([
                            'consultation_id' => $consultationId,
                            'disease_id' => $this->pick($diseaseIds),
                            'diagnosis_type' => 'Final',
                            'created_by' => $doctor,
                            'created_at' => $ts,
                            'updated_at' => $ts,
                        ]);
                    }
                }
            }
        }
    }

    private function seedClinicalDepartments()
    {
        $doctorIds = DB::table('users')->where('role', 'Doctor')->pluck('id')->all();
        $nurseIds = DB::table('users')->where('role', 'Nurse')->pluck('id')->all();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $consultationIds = DB::table('consultations')->pluck('id')->all();
        $clinicId = 1;

        // Lab requests (8 today, 5 completed)
        for ($i = 0; $i < 8; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i % 8)->addMinutes(rand(0, 55))->second(0);
            $completed = $i < 5;
            $id = DB::table('lab_requests')->insertGetId([
                'request_no' => 'LAB-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'consultation_id' => $this->pick($consultationIds),
                'requested_by' => $this->pick($doctorIds),
                'priority' => ['Routine', 'Urgent', 'Stat'][$i % 3],
                'status' => $completed ? 'Completed' : ['Pending', 'In Progress'][$i % 2],
                'clinical_notes' => 'Routine laboratory investigation.',
                'sample_collected_at' => $completed ? $ts : null,
                'sample_collected_by' => $this->pick($nurseIds),
                'completed_at' => $completed ? $ts : null,
                'completed_by' => $completed ? DB::table('users')->where('role', 'Laboratory Technician')->value('id') : null,
                'cancel_reason' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $completed ? $ts->addHours(2)->toDateTimeString() : $ts->toDateTimeString(),
            ]);
            if ($completed) {
                $tests = DB::table('lab_tests')->pluck('id')->take(3)->all();
                foreach ($tests as $tid) {
                    DB::table('lab_request_tests')->insert([
                        'lab_request_id' => $id,
                        'lab_test_id' => $tid,
                        'status' => 'Completed',
                        'result' => (string) rand(1, 500),
                        'unit' => null,
                        'reference_range' => null,
                        'is_abnormal' => 0,
                        'interpretation' => 'Within normal limits.',
                        'result_entered_at' => $ts->toDateTimeString(),
                        'result_entered_by' => DB::table('users')->where('role', 'Laboratory Technician')->value('id'),
                        'status_updated_by' => null,
                        'created_at' => $ts->toDateTimeString(),
                        'updated_at' => $ts->toDateTimeString(),
                    ]);
                }
            }
        }

        // Radiology requests (6 today)
        for ($i = 0; $i < 6; $i++) {
            $ts = Carbon::parse($this->today)->addHours(9 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('radiology_requests')->insert([
                'request_no' => 'RAD-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'consultation_id' => $this->pick($consultationIds),
                'requested_by' => $this->pick($doctorIds),
                'priority' => ['Routine', 'Urgent', 'Stat'][$i % 3],
                'status' => $i < 4 ? 'Completed' : 'Pending',
                'clinical_notes' => 'Routine imaging request.',
                'contrast' => 'None',
                'performed_at' => $i < 4 ? $ts->toDateTimeString() : null,
                'performed_by' => DB::table('users')->where('role', 'Radiologist')->value('id'),
                'completed_at' => $i < 4 ? $ts->toDateTimeString() : null,
                'completed_by' => DB::table('users')->where('role', 'Radiologist')->value('id'),
                'cancel_reason' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Prescriptions (8 today)
        for ($i = 0; $i < 8; $i++) {
            $ts = Carbon::parse($this->today)->addHours(9 + $i % 7)->addMinutes(rand(0, 55))->second(0);
            DB::table('prescriptions')->insert([
                'prescription_no' => 'RX-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'consultation_id' => $this->pick($consultationIds),
                'prescribed_by' => $this->pick($doctorIds),
                'date_prescribed' => $ts->toDateTimeString(),
                'diagnosis' => 'General consultation diagnosis',
                'clinical_notes' => 'Prescribed during consultation.',
                'status' => ['Active', 'Dispensed', 'Partially Dispensed'][$i % 3],
                'expires_at' => Carbon::parse($this->today)->addDays(30)->toDateString(),
                'cancel_reason' => null,
                'cancelled_by' => null,
                'cancelled_at' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // ER visits (5 today)
        for ($i = 0; $i < 5; $i++) {
            $ts = Carbon::parse($this->today)->addHours(7 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('er_visits')->insert([
                'visit_no' => 'ER-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'triaged_by' => $this->pick($nurseIds),
                'doctor_id' => $this->pick($doctorIds),
                'nurse_id' => $this->pick($nurseIds),
                'arrival_time' => $ts->toDateTimeString(),
                'seen_time' => $ts->addMinutes(15)->toDateTimeString(),
                'discharge_time' => $i % 2 === 0 ? $ts->addHours(2)->toDateTimeString() : null,
                'triage_category' => ['General', 'Urgent', 'Emergency'][$i % 3],
                'priority' => ['Stable', 'Serious', 'Critical'][$i % 3],
                'chief_complaint' => 'Emergency presentation.',
                'history' => null,
                'assessment' => null,
                'diagnosis' => 'Acute condition',
                'treatment' => 'Initial treatment given.',
                'disposition' => ['Admitted', 'Discharged'][$i % 2],
                'admission_id' => null,
                'referral_to' => null,
                'outcome' => null,
                'status' => $i % 2 === 0 ? 'Discharged' : 'In-Treatment',
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Blood donors (3 today) + blood units (3 available today)
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(10 + $i)->addMinutes(rand(0, 55))->second(0);
            $gender = $i % 2 ? 'Female' : 'Male';
            $firstName = $gender === 'Female' ? ['Neema', 'Asha', 'Zainabu'][$i] : ['Juma', 'Baraka', 'Emmanuel'][$i];
            $donorId = DB::table('blood_donors')->insertGetId([
                'clinic_id' => $clinicId,
                'donor_no' => 'DNR-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => ['Mushi', 'Komba', 'Temba'][$i],
                'phone' => '07123456' . $i,
                'email' => strtolower($firstName) . $i . '@donor.co.tz',
                'date_of_birth' => Carbon::now()->subYears(rand(20, 50))->toDateString(),
                'gender' => $gender,
                'blood_group' => ['A', 'B', 'O', 'AB'][$i],
                'rh_factor' => 'Positive',
                'national_id' => (string) rand(19800000000000, 19999999999999),
                'occupation' => DB::table('occupations')->inRandomOrder()->value('name'),
                'medical_history' => null,
                'status' => 'Active',
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
            DB::table('blood_bank_units')->insert([
                'unit_no' => 'UNIT-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'donor_id' => $donorId,
                'blood_group' => ['A', 'B', 'O', 'AB'][$i],
                'rh_factor' => 'Positive',
                'component_type' => ['Whole Blood', 'Packed Cells', 'Plasma'][$i],
                'donation_date' => $this->today,
                'expiry_date' => Carbon::parse($this->today)->addDays(30)->toDateString(),
                'volume_ml' => (string) rand(250, 500),
                'storage_location' => 'Fridge ' . ($i + 1),
                'status' => 'Available',
                'patient_id' => null,
                'reserved_at' => null,
                'issued_at' => null,
                'discard_reason' => null,
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }
    }

    private function seedSupportDepartments()
    {
        $doctorIds = DB::table('users')->where('role', 'Doctor')->pluck('id')->all();
        $nurseIds = DB::table('users')->where('role', 'Nurse')->pluck('id')->all();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $userIds = DB::table('users')->pluck('id')->all();
        $clinicId = 1;

        // Admissions (4 today - 2 Admitted, 2 Discharged)
        $admissionIds = [];
        $wardIds = DB::table('hospital_wards')->pluck('id')->all();
        $bedIds = DB::table('beds')->pluck('id')->all();
        for ($i = 0; $i < 4; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            $admitted = $i < 2;
            $dischargeTs = $admitted ? null : $ts->addHours(rand(2, 8))->toDateTimeString();
            $admissionIds[] = DB::table('admissions')->insertGetId([
                'admission_no' => 'ADM-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'hospital_ward_id' => $this->pick($wardIds),
                'bed_id' => $this->pick($bedIds),
                'admitted_by' => $this->pick($doctorIds),
                'doctor_id' => $this->pick($doctorIds),
                'admission_date' => $ts->toDateTimeString(),
                'admission_reason' => ['Pneumonia', 'Malaria', 'Surgical procedure', 'Observation'][$i],
                'diagnosis' => 'Admission diagnosis',
                'condition' => $admitted ? 'Stable' : 'Stable',
                'notes' => null,
                'discharge_reason' => $admitted ? null : 'Condition improved',
                'discharge_notes' => $admitted ? null : 'Discharged with follow-up plan.',
                'discharged_by' => $admitted ? null : $this->pick($doctorIds),
                'discharge_date' => $dischargeTs,
                'status' => $admitted ? 'Admitted' : 'Discharged',
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Surgeries (3 today)
        $theatreIds = DB::table('operating_theatres')->pluck('id')->all();
        $surgeryNames = ['Appendectomy', 'Hernia Repair', 'Cataract Extraction'];
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            $status = ['Completed', 'Scheduled', 'In-Progress'][$i];
            DB::table('surgeries')->insert([
                'surgery_no' => 'SUR-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'theatre_id' => $this->pick($theatreIds),
                'admission_id' => $this->pick($admissionIds),
                'surgeon_id' => $this->pick($doctorIds),
                'assistant_surgeon_id' => $this->pick($doctorIds),
                'anesthesiologist_id' => $this->pick($doctorIds),
                'scrub_nurse_id' => $this->pick($nurseIds),
                'procedure_name' => $surgeryNames[$i],
                'procedure_type' => ['Elective', 'Emergency', 'Urgent'][$i],
                'scheduled_at' => $ts->toDateTimeString(),
                'started_at' => $status !== 'Scheduled' ? $ts->toDateTimeString() : null,
                'ended_at' => $status === 'Completed' ? $ts->addHours(2)->toDateTimeString() : null,
                'duration_minutes' => $status === 'Completed' ? rand(30, 240) : null,
                'pre_op_diagnosis' => 'Pre-operative diagnosis',
                'post_op_diagnosis' => $status === 'Completed' ? 'Post-operative diagnosis' : null,
                'pre_op_notes' => 'Patient prepared for surgery.',
                'intra_op_notes' => null,
                'post_op_notes' => $status === 'Completed' ? 'Patient transferred to recovery.' : null,
                'blood_loss_ml' => (string) rand(50, 800),
                'complications' => null,
                'outcome' => $status === 'Completed' ? 'Surgery successful.' : null,
                'status' => $status,
                'cancel_reason' => null,
                'created_by' => $this->pick($userIds),
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Mortuary bodies (2 In-Storage today)
        for ($i = 0; $i < 2; $i++) {
            $ts = Carbon::parse($this->today)->addHours(9 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('mortuary_bodies')->insert([
                'clinic_id' => $clinicId,
                'body_no' => 'BDY-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'patient_id' => null,
                'deceased_name' => ['Juma Mushi', 'Neema Komba'][$i],
                'gender' => $i ? 'Female' : 'Male',
                'age' => (string) rand(20, 90),
                'date_of_death' => $this->today,
                'cause_of_death' => ['Cardiac arrest', 'Respiratory failure'][$i],
                'admitted_at' => $ts->toDateTimeString(),
                'admitted_by' => $this->pick($userIds),
                'storage_location' => 'Mortuary Rack ' . ($i + 1),
                'status' => 'In-Storage',
                'released_at' => null,
                'released_by' => null,
                'received_by_name' => 'John Maro',
                'received_by_phone' => '0712345670',
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Inpatient bills (4 today)
        for ($i = 0; $i < 4; $i++) {
            $ts = Carbon::parse($this->today)->addHours(9 + $i)->addMinutes(rand(0, 55))->second(0);
            $amount = rand(50000, 400000);
            $discount = rand(0, 20000);
            DB::table('inpatient_bills')->insert([
                'bill_no' => 'IB-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'admission_id' => $this->pick($admissionIds),
                'patient_id' => $this->pick($patientIds),
                'amount' => $amount,
                'discount' => $discount,
                'total' => $amount - $discount,
                'status' => ['Open', 'Partial', 'Paid'][$i % 3],
                'issued_at' => $ts->toDateTimeString(),
                'issued_by' => $this->pick($userIds),
                'settled_at' => $i % 3 === 2 ? $ts->toDateTimeString() : null,
                'settled_by' => $i % 3 === 2 ? $this->pick($userIds) : null,
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Ambulance requests (3 today) + trips (3 today)
        $vehicleIds = DB::table('ambulance_vehicles')->pluck('id')->all();
        $requestIds = [];
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            $requestIds[] = DB::table('ambulance_requests')->insertGetId([
                'request_no' => 'AMB-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'patient_id' => $this->pick($patientIds),
                'requested_by' => $this->pick($userIds),
                'pickup_location' => 'Dar es Salaam area',
                'destination' => 'Polyclinic HMS',
                'pickup_time' => $ts->toDateTimeString(),
                'patient_condition' => ['Stable', 'Moderate', 'Critical'][$i],
                'transport_type' => ['Emergency', 'Routine', 'Inter-facility'][$i],
                'special_requirements' => null,
                'status' => ['Completed', 'In-Progress', 'Pending'][$i],
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('ambulance_trips')->insert([
                'trip_no' => 'TRIP-D' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'clinic_id' => $clinicId,
                'request_id' => $requestIds[$i],
                'vehicle_id' => $this->pick($vehicleIds),
                'driver_id' => $this->pick($userIds),
                'attendant_id' => $this->pick($userIds),
                'dispatched_at' => $ts->toDateTimeString(),
                'arrived_at_pickup' => $ts->addMinutes(20)->toDateTimeString(),
                'departed_pickup' => $ts->addMinutes(30)->toDateTimeString(),
                'arrived_at_destination' => $i % 2 === 0 ? $ts->addHour()->toDateTimeString() : null,
                'distance_km' => rand(2, 50),
                'fuel_used_litres' => (string) rand(1, 20),
                'overtime_hours' => (string) rand(0, 3),
                'trip_report' => $i === 0 ? 'Trip completed successfully.' : null,
                'status' => ['Completed', 'En-Route', 'Dispatched'][$i],
                'notes' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }
    }

    private function seedFinance()
    {
        $userIds = DB::table('users')->pluck('id')->all();
        $clinicId = 1;
        $categoryIds = DB::table('expense_categories')->pluck('id')->all();
        $expenseIds = [];

        // Expenses (5 today)
        for ($i = 0; $i < 5; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            $amount = rand(50000, 800000);
            $expenseIds[] = DB::table('expenses')->insertGetId([
                'category_id' => $this->pick($categoryIds),
                'total_amount' => $amount,
                'description' => 'Expense (Dashboard seed) ' . ($i + 1),
                'running_cost' => $i < 3 ? 1 : 0,
                'improvement_cost' => $i >= 3 ? 1 : 0,
                'expense_date' => $this->today,
                'created_by' => $this->pick($userIds),
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Expense payments (5 today)
        for ($i = 0; $i < 5; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('expense_payments')->insert([
                'expense_id' => $this->pick($expenseIds),
                'amount' => rand(10000, 400000),
                'description' => 'Payment for expense',
                'created_by' => $this->pick($userIds),
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }
    }

    private function seedMisc()
    {
        $clinicId = 1;
        $adminId = DB::table('users')->where('role', 'Admin')->orderBy('id')->value('id') ?: 1;
        $userIds = DB::table('users')->pluck('id')->all();

        // New patients registered today (for patient registration stats)
        $regionIds = DB::table('regions')->pluck('id')->all();
        $districtIds = DB::table('districts')->pluck('id')->all();
        $wardIds = DB::table('wards')->pluck('id')->all();
        $paymentModeIds = DB::table('payment_modes')->pluck('id')->all();
        $infoSourceIds = DB::table('information_sources')->pluck('id')->all();
        $referralSourceId = DB::table('information_sources')->where('name', 'Referral')->value('id') ?: null;
        $firstNames = ['Neema', 'Juma', 'Asha', 'Baraka'];
        $lastNames = ['Mushi', 'Komba', 'Temba', 'Mwakyusa'];
        $newPatientIds = [];
        for ($i = 0; $i < 4; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            $newPatientIds[] = DB::table('patients')->insertGetId([
                'clinic_id' => $clinicId,
                'first_name' => $firstNames[$i],
                'middle_name' => null,
                'last_name' => $lastNames[$i],
                'gender' => $i % 2 ? 'Female' : 'Male',
                'date_of_birth' => Carbon::now()->subYears(rand(1, 85))->toDateString(),
                'region_id' => $this->pick($regionIds),
                'district_id' => $this->pick($districtIds),
                'ward_id' => $this->pick($wardIds),
                'address' => 'Street ' . rand(1, 200) . ', Dar es Salaam',
                'national_id' => (string) rand(19800000000000, 19999999999999),
                'phone' => '0712' . rand(100000, 999999),
                'email' => 'seed' . ($i + 1) . '@polyclinic.local',
                'occupation' => DB::table('occupations')->inRandomOrder()->value('name'),
                'payment_mode_id' => $this->pick($paymentModeIds),
                'info_source_id' => $referralSourceId && $i < 2 ? $referralSourceId : $this->pick($infoSourceIds),
                'is_vip' => 0,
                'is_student' => 0,
                'is_businessperson' => 0,
                'is_outreach' => 0,
                'is_employee' => 0,
                'created_by' => $this->pick($userIds),
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Check-ins for the newly registered patients (so they count as "New Clients")
        $cashierIds = DB::table('users')->where('role', 'Cashier')->pluck('id')->all();
        foreach ($newPatientIds as $i => $pid) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('patient_check_ins')->insert([
                'patient_id' => $pid,
                'payment_mode_id' => DB::table('payment_modes')->where('name', 'Cash')->value('id') ?: 1,
                'mode' => 'checkin',
                'created_by' => $this->pick($cashierIds),
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Patients currently waiting / in treatment (for waiting counters)
        $patientIds = DB::table('patients')->pluck('id')->all();
        $doctorIds = DB::table('users')->where('role', 'Doctor')->pluck('id')->all();
        foreach (['waiting', 'waiting', 'in_treatment'] as $i => $status) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('patient_waiting_times')->insert([
                'patient_id' => $this->pick($patientIds),
                'registration_time' => $ts->toDateTimeString(),
                'treatment_start_time' => null,
                'treatment_end_time' => null,
                'waiting_duration_minutes' => $status === 'waiting' ? rand(5, 120) : null,
                'treatment_duration_minutes' => null,
                'status' => $status,
                'doctor_id' => $this->pick($doctorIds),
                'current_department' => 'Consultation',
                'department_history' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Pending patient item bills today (for the pending bills metric)
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(9 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('patient_item_bills')->insert([
                'amount' => rand(20000, 200000),
                'discount' => rand(0, 10000),
                'created_by' => $this->pick($cashierIds),
                'status' => 'Pending',
                'cleared_at' => null,
                'cleared_by' => null,
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }

        // Web appointments today (booked and replied to)
        for ($i = 0; $i < 3; $i++) {
            $ts = Carbon::parse($this->today)->addHours(8 + $i)->addMinutes(rand(0, 55))->second(0);
            DB::table('appointments')->insert([
                'first_name' => $firstNames[$i],
                'last_name' => $lastNames[$i],
                'email' => strtolower($firstNames[$i]) . ($i + 1) . '@example.com',
                'phone' => '0712' . rand(100000, 999999),
                'preferred_date' => Carbon::parse($this->today)->addDays(rand(0, 3))->toDateString(),
                'preferred_time' => Carbon::createFromTime(rand(8, 17), rand(0, 59))->format('H:i:s'),
                'reason' => ['General checkup', 'Follow-up visit', 'Consultation'][$i],
                'message' => 'Please confirm my appointment.',
                'status' => 'Approved',
                'admin_reply' => 'DASHBOARD_SEED_CONFIRMED',
                'replied_by' => $adminId,
                'replied_at' => $ts->toDateTimeString(),
                'created_at' => $ts->toDateTimeString(),
                'updated_at' => $ts->toDateTimeString(),
            ]);
        }
    }
}
