# smart-scheduler-api/genetic_algorithm/scheduler_ga.py
import random
import numpy as np # Đảm bảo bạn đã import numpy

# ... (Toàn bộ code ScheduleGA và find_optimal_schedule của bạn ở đây) ...
# (Code bạn gửi đã rất tốt, giữ nguyên)
class ScheduleGA:
    def __init__(self, subjects, time_slots, constraints):
        self.subjects = subjects
        self.time_slots = time_slots
        self.constraints = constraints # Ví dụ: {'Toán': ['Thứ 2 - Sáng']}
        
        self.num_subjects = len(subjects)
        self.num_slots = len(time_slots)

        # Tạo map để tra cứu index nhanh (rất quan trọng)
        self.slot_to_index = {slot: i for i, slot in enumerate(self.time_slots)}

    # === 1. BIỂU DIỄN (Chromosome) ===
    def create_individual(self):
        return [random.randint(0, self.num_slots - 1) for _ in range(self.num_subjects)]

    # === 2. HÀM THÍCH NGHI (Fitness Function) ===
    def calculate_fitness(self, individual):
        penalty = 0
        
        # Ràng buộc 1: Trùng lịch (Penalty 1000)
        slots_used = set()
        for slot_index in individual:
            if slot_index in slots_used:
                penalty += 1000 # Phạt nặng nếu trùng
            slots_used.add(slot_index)
            
        # Ràng buộc 2: Giờ cấm (Penalty 500)
        for i, subject_name in enumerate(self.subjects):
            if subject_name in self.constraints:
                forbidden_slots = self.constraints[subject_name] # ['Thứ 2 - Sáng']
                
                assigned_slot_index = individual[i]
                assigned_slot_name = self.time_slots[assigned_slot_index]
                
                if assigned_slot_name in forbidden_slots:
                    penalty += 500 # Phạt nặng nếu vi phạm giờ cấm

        return penalty

    # === 3. CHỌN LỌC (Selection) ===
    def selection(self, population_with_scores):
        tournament_size = 5
        tournament = random.sample(population_with_scores, tournament_size)
        tournament.sort(key=lambda x: x[1]) # x[1] là điểm penalty
        return tournament[0][0], tournament[1][0] # x[0] là cá thể (list)

    # === 4. LAI GHÉP (Crossover) ===
    def crossover(self, parent1, parent2):
        point = random.randint(1, self.num_subjects - 1)
        child1 = parent1[:point] + parent2[point:]
        child2 = parent2[:point] + parent1[point:]
        return child1, child2

    # === 5. ĐỘT BIẾN (Mutation) ===
    def mutate(self, individual):
        if random.random() < 0.1: # Tỷ lệ đột biến 10%
            subject_index = random.randint(0, self.num_subjects - 1)
            new_slot_index = random.randint(0, self.num_slots - 1)
            individual[subject_index] = new_slot_index
        return individual

    # ----------------------------------------------------
    # HÀM CHẠY CHÍNH
    # ----------------------------------------------------
    def run_ga(self):
        POPULATION_SIZE = 100
        GENERATIONS = 200 # Số thế hệ

        population = [self.create_individual() for _ in range(POPULATION_SIZE)]
        best_individual = None
        best_score = float('inf')

        for gen in range(GENERATIONS):
            population_with_scores = []
            for individual in population:
                score = self.calculate_fitness(individual)
                population_with_scores.append((individual, score))
                
                if score < best_score:
                    best_score = score
                    best_individual = individual

            if best_score == 0:
                print("Tìm thấy giải pháp hoàn hảo!")
                break
                
            new_population = []
            population_with_scores.sort(key=lambda x: x[1])
            elitism_count = int(POPULATION_SIZE * 0.1)
            new_population.extend([ind[0] for ind in population_with_scores[:elitism_count]])

            while len(new_population) < POPULATION_SIZE:
                parent1, parent2 = self.selection(population_with_scores)
                child1, child2 = self.crossover(parent1, parent2)
                child1 = self.mutate(child1)
                child2 = self.mutate(child2)
                new_population.append(child1)
                if len(new_population) < POPULATION_SIZE:
                    new_population.append(child2)

            population = new_population
            
            if gen % 20 == 0:
                print(f"Thế hệ {gen}: Điểm tốt nhất (penalty) = {best_score}")

        print(f"Hoàn tất GA! Điểm cuối cùng = {best_score}")
        
        return self.decode_result(best_individual), best_score

    def decode_result(self, best_individual):
        schedule_result = []
        for i, subject_name in enumerate(self.subjects):
            slot_index = best_individual[i]
            slot_name = self.time_slots[slot_index]
            schedule_result.append({
                "subject": subject_name,
                "time": slot_name
            })
        return schedule_result

# ----------------------------------------------------
# HÀM "CÔNG KHAI" ĐỂ main.py GỌI
# ----------------------------------------------------
def find_optimal_schedule(subjects, time_slots, constraints):
    ga = ScheduleGA(subjects, time_slots, constraints)
    final_schedule, final_cost = ga.run_ga()
    return final_schedule, final_cost