-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2025 at 06:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `insurance_calculator`
--

-- --------------------------------------------------------

--
-- Table structure for table `calculations`
--

CREATE TABLE `calculations` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `hr_total_lives` int(11) NOT NULL DEFAULT 0,
  `hr_total_premium` decimal(10,2) NOT NULL DEFAULT 0.00,
  `maternity_total_lives` int(11) NOT NULL DEFAULT 0,
  `maternity_total_premium` decimal(10,2) NOT NULL DEFAULT 0.00,
  `waiver_percentage` int(11) NOT NULL DEFAULT 0,
  `maternity_coverage_status` varchar(100) DEFAULT NULL,
  `final_calculation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`final_calculation`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calculations`
--

INSERT INTO `calculations` (`id`, `quotation_id`, `hr_total_lives`, `hr_total_premium`, `maternity_total_lives`, `maternity_total_premium`, `waiver_percentage`, `maternity_coverage_status`, `final_calculation`, `created_at`) VALUES
(1, 1, 20, 772721.00, 9, 476139.00, 15, 'Eligible with 6-month waiting period', NULL, '2025-03-02 17:09:27');

-- --------------------------------------------------------

--
-- Table structure for table `hr_plans`
--

CREATE TABLE `hr_plans` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `plan_type` varchar(50) NOT NULL,
  `age_band` varchar(50) NOT NULL,
  `number_of_lives` int(11) NOT NULL DEFAULT 0,
  `premium_rate` decimal(10,2) NOT NULL,
  `calculated_premium` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hr_plans`
--

INSERT INTO `hr_plans` (`id`, `quotation_id`, `plan_type`, `age_band`, `number_of_lives`, `premium_rate`, `calculated_premium`, `created_at`) VALUES
(1, 1, 'Plan A', '0-17', 2, 33737.00, 67474.00, '2025-03-02 17:09:27'),
(2, 1, 'Plan A', '18-29', 3, 24428.00, 73284.00, '2025-03-02 17:09:27'),
(3, 1, 'Plan A', '50-59', 5, 75509.00, 377545.00, '2025-03-02 17:09:27'),
(4, 1, 'Plan B', '30-39', 4, 20709.00, 82836.00, '2025-03-02 17:09:27'),
(5, 1, 'Plan B', '40-49', 6, 28597.00, 171582.00, '2025-03-02 17:09:27');

-- --------------------------------------------------------

--
-- Table structure for table `maternity_plans`
--

CREATE TABLE `maternity_plans` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `plan_type` varchar(50) NOT NULL,
  `age_band` varchar(50) NOT NULL,
  `number_of_spouses` int(11) NOT NULL DEFAULT 0,
  `premium_rate` decimal(10,2) NOT NULL,
  `calculated_premium` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maternity_plans`
--

INSERT INTO `maternity_plans` (`id`, `quotation_id`, `plan_type`, `age_band`, `number_of_spouses`, `premium_rate`, `calculated_premium`, `created_at`) VALUES
(1, 1, 'Plan A', 'upto 25', 3, 73863.00, 221589.00, '2025-03-02 17:09:50'),
(2, 1, 'Plan A', '26-30', 4, 56135.00, 224540.00, '2025-03-02 17:09:50'),
(3, 1, 'Plan A', '36-40', 2, 15005.00, 30010.00, '2025-03-02 17:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `plan_selections`
--

CREATE TABLE `plan_selections` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `plan_type` enum('hr','maternity') NOT NULL,
  `selected_plans` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`selected_plans`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_selections`
--

INSERT INTO `plan_selections` (`id`, `quotation_id`, `plan_type`, `selected_plans`, `created_at`) VALUES
(1, 1, 'hr', '[{\"planType\":\"Plan A\",\"ageBands\":[{\"ageRange\":\"0-17\",\"numberOfLives\":0},{\"ageRange\":\"18-29\",\"numberOfLives\":0},{\"ageRange\":\"30-39\",\"numberOfLives\":0},{\"ageRange\":\"40-49\",\"numberOfLives\":0},{\"ageRange\":\"50-59\",\"numberOfLives\":0},{\"ageRange\":\"60-64\",\"numberOfLives\":0},{\"ageRange\":\"65\",\"numberOfLives\":0}]},{\"planType\":\"Plan B\",\"ageBands\":[{\"ageRange\":\"0-17\",\"numberOfLives\":0},{\"ageRange\":\"18-29\",\"numberOfLives\":0},{\"ageRange\":\"30-39\",\"numberOfLives\":0},{\"ageRange\":\"40-49\",\"numberOfLives\":0},{\"ageRange\":\"50-59\",\"numberOfLives\":0},{\"ageRange\":\"60-64\",\"numberOfLives\":0},{\"ageRange\":\"65\",\"numberOfLives\":0}]}]', '2025-03-02 17:09:06'),
(2, 1, 'maternity', '[{\"planType\":\"Plan A\",\"ageBands\":[{\"ageRange\":\"upto 25\",\"numberOfSpouses\":0},{\"ageRange\":\"26-30\",\"numberOfSpouses\":0},{\"ageRange\":\"31-35\",\"numberOfSpouses\":0},{\"ageRange\":\"36-40\",\"numberOfSpouses\":0},{\"ageRange\":\"41-45\",\"numberOfSpouses\":0}]}]', '2025-03-02 17:09:17');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `include_maternity` tinyint(1) DEFAULT 0,
  `status` enum('draft','submitted') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `user_id`, `include_maternity`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'submitted', '2025-03-02 17:09:01', '2025-03-02 17:10:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `work_email` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `mobile_number`, `company_name`, `work_email`, `created_at`) VALUES
(1, 'John', 'Doe', '1234567890', 'ABC Corp', 'john@example.com', '2025-03-02 17:08:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calculations`
--
ALTER TABLE `calculations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`);

--
-- Indexes for table `hr_plans`
--
ALTER TABLE `hr_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`);

--
-- Indexes for table `maternity_plans`
--
ALTER TABLE `maternity_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`);

--
-- Indexes for table `plan_selections`
--
ALTER TABLE `plan_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calculations`
--
ALTER TABLE `calculations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hr_plans`
--
ALTER TABLE `hr_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `maternity_plans`
--
ALTER TABLE `maternity_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `plan_selections`
--
ALTER TABLE `plan_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calculations`
--
ALTER TABLE `calculations`
  ADD CONSTRAINT `calculations_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`);

--
-- Constraints for table `hr_plans`
--
ALTER TABLE `hr_plans`
  ADD CONSTRAINT `hr_plans_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`);

--
-- Constraints for table `maternity_plans`
--
ALTER TABLE `maternity_plans`
  ADD CONSTRAINT `maternity_plans_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`);

--
-- Constraints for table `plan_selections`
--
ALTER TABLE `plan_selections`
  ADD CONSTRAINT `plan_selections_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`);

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
