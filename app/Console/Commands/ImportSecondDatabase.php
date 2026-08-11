<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportSecondDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:second-database {file=polyclinic-2.sql : The SQL file to import} {--ignore-duplicates : Use INSERT IGNORE to skip duplicates}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import data from second SQL file, skipping table creation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        $ignoreDuplicates = $this->option('ignore-duplicates');
        
        if (!file_exists($file)) {
            $this->error("File {$file} not found!");
            return 1;
        }

        $this->info("Starting import from {$file}...");
        if ($ignoreDuplicates) {
            $this->info("Duplicate records will be ignored.");
        }
        
        // Read the SQL file
        $sqlContent = file_get_contents($file);
        
        // Extract only INSERT statements
        preg_match_all('/INSERT INTO `([^`]+)`[^;]+;/', $sqlContent, $matches, PREG_SET_ORDER);
        
        if (empty($matches)) {
            $this->warn("No INSERT statements found in the file.");
            return 0;
        }

        $this->info("Found " . count($matches) . " INSERT statements to process.");
        
        $importedCount = 0;
        $skippedCount = 0;
        $errorCount = 0;
        $duplicateCount = 0;

        foreach ($matches as $match) {
            $tableName = $match[1];
            $insertStatement = $match[0];
            
            $this->line("Processing table: {$tableName}");
            
            // Check if table exists
            if (!Schema::hasTable($tableName)) {
                $this->warn("Table {$tableName} does not exist, skipping...");
                $skippedCount++;
                continue;
            }
            
            try {
                // Modify INSERT statement to handle duplicates if requested
                if ($ignoreDuplicates) {
                    $insertStatement = str_replace('INSERT INTO', 'INSERT IGNORE INTO', $insertStatement);
                }
                
                // Use raw SQL to execute the INSERT statement
                DB::unprepared($insertStatement);
                $importedCount++;
                $this->info("✓ Successfully imported data into {$tableName}");
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                
                // Check if it's a duplicate key error
                if (strpos($errorMessage, 'Duplicate entry') !== false) {
                    $duplicateCount++;
                    $this->warn("⚠ Duplicate records found in {$tableName} (skipped)");
                } else {
                    $errorCount++;
                    $this->error("✗ Error importing into {$tableName}: " . $errorMessage);
                }
            }
        }
        
        $this->newLine();
        $this->info("Import completed!");
        $this->info("Successfully imported: {$importedCount} tables");
        $this->info("Skipped (duplicates): {$duplicateCount} tables");
        $this->info("Skipped (missing tables): {$skippedCount} tables");
        $this->info("Errors: {$errorCount} tables");
        
        if ($duplicateCount > 0 && !$ignoreDuplicates) {
            $this->newLine();
            $this->warn("Tip: Use --ignore-duplicates flag to automatically skip duplicate records.");
        }
        
        return 0;
    }
}
