; ModuleID = 'troll_module'
source_filename = "troll_module"

%TrollValue = type { i32, double, ptr }

declare i32 @printf(ptr, ...)

declare ptr @troll_create_array(i32)

declare void @troll_print_value(i32, double, ptr)

declare void @troll_array_set(ptr, i32, double)

declare double @troll_array_get(ptr, i32)

define i32 @main() {
entry:
  %arrPtr = call ptr @troll_create_array(i32 3)
  %0 = alloca %TrollValue, align 8
  %1 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 0
  %2 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 1
  store i32 0, ptr %1, align 4
  store double 5.000000e-01, ptr %2, align 8
  %3 = load %TrollValue, ptr %0, align 8
  %rawNum = extractvalue %TrollValue %3, 1
  call void @troll_array_set(ptr %arrPtr, i32 0, double %rawNum)
  %4 = alloca %TrollValue, align 8
  %5 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 0
  %6 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 1
  store i32 0, ptr %5, align 4
  store double 2.000000e-01, ptr %6, align 8
  %7 = load %TrollValue, ptr %4, align 8
  %rawNum1 = extractvalue %TrollValue %7, 1
  call void @troll_array_set(ptr %arrPtr, i32 1, double %rawNum1)
  %8 = alloca %TrollValue, align 8
  %9 = getelementptr inbounds nuw %TrollValue, ptr %8, i32 0, i32 0
  %10 = getelementptr inbounds nuw %TrollValue, ptr %8, i32 0, i32 1
  store i32 0, ptr %9, align 4
  store double 9.000000e-01, ptr %10, align 8
  %11 = load %TrollValue, ptr %8, align 8
  %rawNum2 = extractvalue %TrollValue %11, 1
  call void @troll_array_set(ptr %arrPtr, i32 2, double %rawNum2)
  %12 = alloca %TrollValue, align 8
  %13 = getelementptr inbounds nuw %TrollValue, ptr %12, i32 0, i32 0
  %14 = getelementptr inbounds nuw %TrollValue, ptr %12, i32 0, i32 2
  store i32 1, ptr %13, align 4
  store ptr %arrPtr, ptr %14, align 8
  %15 = load %TrollValue, ptr %12, align 8
  %x = alloca %TrollValue, align 8
  store %TrollValue %15, ptr %x, align 8
  %arrPtr3 = call ptr @troll_create_array(i32 12)
  %16 = alloca %TrollValue, align 8
  %17 = getelementptr inbounds nuw %TrollValue, ptr %16, i32 0, i32 0
  %18 = getelementptr inbounds nuw %TrollValue, ptr %16, i32 0, i32 1
  store i32 0, ptr %17, align 4
  store double 8.000000e-01, ptr %18, align 8
  %19 = load %TrollValue, ptr %16, align 8
  %rawNum4 = extractvalue %TrollValue %19, 1
  call void @troll_array_set(ptr %arrPtr3, i32 0, double %rawNum4)
  %20 = alloca %TrollValue, align 8
  %21 = getelementptr inbounds nuw %TrollValue, ptr %20, i32 0, i32 0
  %22 = getelementptr inbounds nuw %TrollValue, ptr %20, i32 0, i32 1
  store i32 0, ptr %21, align 4
  store double 1.000000e-01, ptr %22, align 8
  %23 = load %TrollValue, ptr %20, align 8
  %rawNum5 = extractvalue %TrollValue %23, 1
  call void @troll_array_set(ptr %arrPtr3, i32 1, double %rawNum5)
  %24 = alloca %TrollValue, align 8
  %25 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 0
  %26 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 1
  store i32 0, ptr %25, align 4
  store double 4.000000e-01, ptr %26, align 8
  %27 = load %TrollValue, ptr %24, align 8
  %rawNum6 = extractvalue %TrollValue %27, 1
  call void @troll_array_set(ptr %arrPtr3, i32 2, double %rawNum6)
  %28 = alloca %TrollValue, align 8
  %29 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 0
  %30 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 1
  store i32 0, ptr %29, align 4
  store double 3.000000e-01, ptr %30, align 8
  %31 = load %TrollValue, ptr %28, align 8
  %rawNum7 = extractvalue %TrollValue %31, 1
  call void @troll_array_set(ptr %arrPtr3, i32 3, double %rawNum7)
  %32 = alloca %TrollValue, align 8
  %33 = getelementptr inbounds nuw %TrollValue, ptr %32, i32 0, i32 0
  %34 = getelementptr inbounds nuw %TrollValue, ptr %32, i32 0, i32 1
  store i32 0, ptr %33, align 4
  store double 9.000000e-01, ptr %34, align 8
  %35 = load %TrollValue, ptr %32, align 8
  %rawNum8 = extractvalue %TrollValue %35, 1
  call void @troll_array_set(ptr %arrPtr3, i32 4, double %rawNum8)
  %36 = alloca %TrollValue, align 8
  %37 = getelementptr inbounds nuw %TrollValue, ptr %36, i32 0, i32 0
  %38 = getelementptr inbounds nuw %TrollValue, ptr %36, i32 0, i32 1
  store i32 0, ptr %37, align 4
  store double 2.000000e-01, ptr %38, align 8
  %39 = load %TrollValue, ptr %36, align 8
  %rawNum9 = extractvalue %TrollValue %39, 1
  call void @troll_array_set(ptr %arrPtr3, i32 5, double %rawNum9)
  %40 = alloca %TrollValue, align 8
  %41 = getelementptr inbounds nuw %TrollValue, ptr %40, i32 0, i32 0
  %42 = getelementptr inbounds nuw %TrollValue, ptr %40, i32 0, i32 1
  store i32 0, ptr %41, align 4
  store double 5.000000e-01, ptr %42, align 8
  %43 = load %TrollValue, ptr %40, align 8
  %rawNum10 = extractvalue %TrollValue %43, 1
  call void @troll_array_set(ptr %arrPtr3, i32 6, double %rawNum10)
  %44 = alloca %TrollValue, align 8
  %45 = getelementptr inbounds nuw %TrollValue, ptr %44, i32 0, i32 0
  %46 = getelementptr inbounds nuw %TrollValue, ptr %44, i32 0, i32 1
  store i32 0, ptr %45, align 4
  store double 5.000000e-01, ptr %46, align 8
  %47 = load %TrollValue, ptr %44, align 8
  %rawNum11 = extractvalue %TrollValue %47, 1
  call void @troll_array_set(ptr %arrPtr3, i32 7, double %rawNum11)
  %48 = alloca %TrollValue, align 8
  %49 = getelementptr inbounds nuw %TrollValue, ptr %48, i32 0, i32 0
  %50 = getelementptr inbounds nuw %TrollValue, ptr %48, i32 0, i32 1
  store i32 0, ptr %49, align 4
  store double 5.000000e-01, ptr %50, align 8
  %51 = load %TrollValue, ptr %48, align 8
  %rawNum12 = extractvalue %TrollValue %51, 1
  call void @troll_array_set(ptr %arrPtr3, i32 8, double %rawNum12)
  %52 = alloca %TrollValue, align 8
  %53 = getelementptr inbounds nuw %TrollValue, ptr %52, i32 0, i32 0
  %54 = getelementptr inbounds nuw %TrollValue, ptr %52, i32 0, i32 1
  store i32 0, ptr %53, align 4
  store double 1.000000e-01, ptr %54, align 8
  %55 = load %TrollValue, ptr %52, align 8
  %rawNum13 = extractvalue %TrollValue %55, 1
  call void @troll_array_set(ptr %arrPtr3, i32 9, double %rawNum13)
  %56 = alloca %TrollValue, align 8
  %57 = getelementptr inbounds nuw %TrollValue, ptr %56, i32 0, i32 0
  %58 = getelementptr inbounds nuw %TrollValue, ptr %56, i32 0, i32 1
  store i32 0, ptr %57, align 4
  store double 0x3FE6666666666666, ptr %58, align 8
  %59 = load %TrollValue, ptr %56, align 8
  %rawNum14 = extractvalue %TrollValue %59, 1
  call void @troll_array_set(ptr %arrPtr3, i32 10, double %rawNum14)
  %60 = alloca %TrollValue, align 8
  %61 = getelementptr inbounds nuw %TrollValue, ptr %60, i32 0, i32 0
  %62 = getelementptr inbounds nuw %TrollValue, ptr %60, i32 0, i32 1
  store i32 0, ptr %61, align 4
  store double 6.000000e-01, ptr %62, align 8
  %63 = load %TrollValue, ptr %60, align 8
  %rawNum15 = extractvalue %TrollValue %63, 1
  call void @troll_array_set(ptr %arrPtr3, i32 11, double %rawNum15)
  %64 = alloca %TrollValue, align 8
  %65 = getelementptr inbounds nuw %TrollValue, ptr %64, i32 0, i32 0
  %66 = getelementptr inbounds nuw %TrollValue, ptr %64, i32 0, i32 2
  store i32 1, ptr %65, align 4
  store ptr %arrPtr3, ptr %66, align 8
  %67 = load %TrollValue, ptr %64, align 8
  %w1 = alloca %TrollValue, align 8
  store %TrollValue %67, ptr %w1, align 8
  %arrPtr16 = call ptr @troll_create_array(i32 4)
  %68 = alloca %TrollValue, align 8
  %69 = getelementptr inbounds nuw %TrollValue, ptr %68, i32 0, i32 0
  %70 = getelementptr inbounds nuw %TrollValue, ptr %68, i32 0, i32 1
  store i32 0, ptr %69, align 4
  store double 1.000000e-01, ptr %70, align 8
  %71 = load %TrollValue, ptr %68, align 8
  %rawNum17 = extractvalue %TrollValue %71, 1
  call void @troll_array_set(ptr %arrPtr16, i32 0, double %rawNum17)
  %72 = alloca %TrollValue, align 8
  %73 = getelementptr inbounds nuw %TrollValue, ptr %72, i32 0, i32 0
  %74 = getelementptr inbounds nuw %TrollValue, ptr %72, i32 0, i32 1
  store i32 0, ptr %73, align 4
  store double 0.000000e+00, ptr %74, align 8
  %75 = load %TrollValue, ptr %72, align 8
  %rawNum18 = extractvalue %TrollValue %75, 1
  call void @troll_array_set(ptr %arrPtr16, i32 1, double %rawNum18)
  %76 = alloca %TrollValue, align 8
  %77 = getelementptr inbounds nuw %TrollValue, ptr %76, i32 0, i32 0
  %78 = getelementptr inbounds nuw %TrollValue, ptr %76, i32 0, i32 1
  store i32 0, ptr %77, align 4
  store double 2.000000e-01, ptr %78, align 8
  %79 = load %TrollValue, ptr %76, align 8
  %rawNum19 = extractvalue %TrollValue %79, 1
  call void @troll_array_set(ptr %arrPtr16, i32 2, double %rawNum19)
  %80 = alloca %TrollValue, align 8
  %81 = getelementptr inbounds nuw %TrollValue, ptr %80, i32 0, i32 0
  %82 = getelementptr inbounds nuw %TrollValue, ptr %80, i32 0, i32 1
  store i32 0, ptr %81, align 4
  store double 1.000000e-01, ptr %82, align 8
  %83 = load %TrollValue, ptr %80, align 8
  %rawNum20 = extractvalue %TrollValue %83, 1
  call void @troll_array_set(ptr %arrPtr16, i32 3, double %rawNum20)
  %84 = alloca %TrollValue, align 8
  %85 = getelementptr inbounds nuw %TrollValue, ptr %84, i32 0, i32 0
  %86 = getelementptr inbounds nuw %TrollValue, ptr %84, i32 0, i32 2
  store i32 1, ptr %85, align 4
  store ptr %arrPtr16, ptr %86, align 8
  %87 = load %TrollValue, ptr %84, align 8
  %b1 = alloca %TrollValue, align 8
  store %TrollValue %87, ptr %b1, align 8
  %arrPtr21 = call ptr @troll_create_array(i32 8)
  %88 = alloca %TrollValue, align 8
  %89 = getelementptr inbounds nuw %TrollValue, ptr %88, i32 0, i32 0
  %90 = getelementptr inbounds nuw %TrollValue, ptr %88, i32 0, i32 1
  store i32 0, ptr %89, align 4
  store double 6.000000e-01, ptr %90, align 8
  %91 = load %TrollValue, ptr %88, align 8
  %rawNum22 = extractvalue %TrollValue %91, 1
  call void @troll_array_set(ptr %arrPtr21, i32 0, double %rawNum22)
  %92 = alloca %TrollValue, align 8
  %93 = getelementptr inbounds nuw %TrollValue, ptr %92, i32 0, i32 0
  %94 = getelementptr inbounds nuw %TrollValue, ptr %92, i32 0, i32 1
  store i32 0, ptr %93, align 4
  store double 2.000000e-01, ptr %94, align 8
  %95 = load %TrollValue, ptr %92, align 8
  %rawNum23 = extractvalue %TrollValue %95, 1
  call void @troll_array_set(ptr %arrPtr21, i32 1, double %rawNum23)
  %96 = alloca %TrollValue, align 8
  %97 = getelementptr inbounds nuw %TrollValue, ptr %96, i32 0, i32 0
  %98 = getelementptr inbounds nuw %TrollValue, ptr %96, i32 0, i32 1
  store i32 0, ptr %97, align 4
  store double 9.000000e-01, ptr %98, align 8
  %99 = load %TrollValue, ptr %96, align 8
  %rawNum24 = extractvalue %TrollValue %99, 1
  call void @troll_array_set(ptr %arrPtr21, i32 2, double %rawNum24)
  %100 = alloca %TrollValue, align 8
  %101 = getelementptr inbounds nuw %TrollValue, ptr %100, i32 0, i32 0
  %102 = getelementptr inbounds nuw %TrollValue, ptr %100, i32 0, i32 1
  store i32 0, ptr %101, align 4
  store double 1.000000e-01, ptr %102, align 8
  %103 = load %TrollValue, ptr %100, align 8
  %rawNum25 = extractvalue %TrollValue %103, 1
  call void @troll_array_set(ptr %arrPtr21, i32 3, double %rawNum25)
  %104 = alloca %TrollValue, align 8
  %105 = getelementptr inbounds nuw %TrollValue, ptr %104, i32 0, i32 0
  %106 = getelementptr inbounds nuw %TrollValue, ptr %104, i32 0, i32 1
  store i32 0, ptr %105, align 4
  store double 3.000000e-01, ptr %106, align 8
  %107 = load %TrollValue, ptr %104, align 8
  %rawNum26 = extractvalue %TrollValue %107, 1
  call void @troll_array_set(ptr %arrPtr21, i32 4, double %rawNum26)
  %108 = alloca %TrollValue, align 8
  %109 = getelementptr inbounds nuw %TrollValue, ptr %108, i32 0, i32 0
  %110 = getelementptr inbounds nuw %TrollValue, ptr %108, i32 0, i32 1
  store i32 0, ptr %109, align 4
  store double 8.000000e-01, ptr %110, align 8
  %111 = load %TrollValue, ptr %108, align 8
  %rawNum27 = extractvalue %TrollValue %111, 1
  call void @troll_array_set(ptr %arrPtr21, i32 5, double %rawNum27)
  %112 = alloca %TrollValue, align 8
  %113 = getelementptr inbounds nuw %TrollValue, ptr %112, i32 0, i32 0
  %114 = getelementptr inbounds nuw %TrollValue, ptr %112, i32 0, i32 1
  store i32 0, ptr %113, align 4
  store double 4.000000e-01, ptr %114, align 8
  %115 = load %TrollValue, ptr %112, align 8
  %rawNum28 = extractvalue %TrollValue %115, 1
  call void @troll_array_set(ptr %arrPtr21, i32 6, double %rawNum28)
  %116 = alloca %TrollValue, align 8
  %117 = getelementptr inbounds nuw %TrollValue, ptr %116, i32 0, i32 0
  %118 = getelementptr inbounds nuw %TrollValue, ptr %116, i32 0, i32 1
  store i32 0, ptr %117, align 4
  store double 0x3FE6666666666666, ptr %118, align 8
  %119 = load %TrollValue, ptr %116, align 8
  %rawNum29 = extractvalue %TrollValue %119, 1
  call void @troll_array_set(ptr %arrPtr21, i32 7, double %rawNum29)
  %120 = alloca %TrollValue, align 8
  %121 = getelementptr inbounds nuw %TrollValue, ptr %120, i32 0, i32 0
  %122 = getelementptr inbounds nuw %TrollValue, ptr %120, i32 0, i32 2
  store i32 1, ptr %121, align 4
  store ptr %arrPtr21, ptr %122, align 8
  %123 = load %TrollValue, ptr %120, align 8
  %w2 = alloca %TrollValue, align 8
  store %TrollValue %123, ptr %w2, align 8
  %arrPtr30 = call ptr @troll_create_array(i32 2)
  %124 = alloca %TrollValue, align 8
  %125 = getelementptr inbounds nuw %TrollValue, ptr %124, i32 0, i32 0
  %126 = getelementptr inbounds nuw %TrollValue, ptr %124, i32 0, i32 1
  store i32 0, ptr %125, align 4
  store double 5.000000e-02, ptr %126, align 8
  %127 = load %TrollValue, ptr %124, align 8
  %rawNum31 = extractvalue %TrollValue %127, 1
  call void @troll_array_set(ptr %arrPtr30, i32 0, double %rawNum31)
  %128 = alloca %TrollValue, align 8
  %129 = getelementptr inbounds nuw %TrollValue, ptr %128, i32 0, i32 0
  %130 = getelementptr inbounds nuw %TrollValue, ptr %128, i32 0, i32 1
  store i32 0, ptr %129, align 4
  store double 1.000000e-01, ptr %130, align 8
  %131 = load %TrollValue, ptr %128, align 8
  %rawNum32 = extractvalue %TrollValue %131, 1
  call void @troll_array_set(ptr %arrPtr30, i32 1, double %rawNum32)
  %132 = alloca %TrollValue, align 8
  %133 = getelementptr inbounds nuw %TrollValue, ptr %132, i32 0, i32 0
  %134 = getelementptr inbounds nuw %TrollValue, ptr %132, i32 0, i32 2
  store i32 1, ptr %133, align 4
  store ptr %arrPtr30, ptr %134, align 8
  %135 = load %TrollValue, ptr %132, align 8
  %b2 = alloca %TrollValue, align 8
  store %TrollValue %135, ptr %b2, align 8
  %arrPtr33 = call ptr @troll_create_array(i32 4)
  %136 = alloca %TrollValue, align 8
  %137 = getelementptr inbounds nuw %TrollValue, ptr %136, i32 0, i32 0
  %138 = getelementptr inbounds nuw %TrollValue, ptr %136, i32 0, i32 1
  store i32 0, ptr %137, align 4
  store double 0.000000e+00, ptr %138, align 8
  %139 = load %TrollValue, ptr %136, align 8
  %rawNum34 = extractvalue %TrollValue %139, 1
  call void @troll_array_set(ptr %arrPtr33, i32 0, double %rawNum34)
  %140 = alloca %TrollValue, align 8
  %141 = getelementptr inbounds nuw %TrollValue, ptr %140, i32 0, i32 0
  %142 = getelementptr inbounds nuw %TrollValue, ptr %140, i32 0, i32 1
  store i32 0, ptr %141, align 4
  store double 0.000000e+00, ptr %142, align 8
  %143 = load %TrollValue, ptr %140, align 8
  %rawNum35 = extractvalue %TrollValue %143, 1
  call void @troll_array_set(ptr %arrPtr33, i32 1, double %rawNum35)
  %144 = alloca %TrollValue, align 8
  %145 = getelementptr inbounds nuw %TrollValue, ptr %144, i32 0, i32 0
  %146 = getelementptr inbounds nuw %TrollValue, ptr %144, i32 0, i32 1
  store i32 0, ptr %145, align 4
  store double 0.000000e+00, ptr %146, align 8
  %147 = load %TrollValue, ptr %144, align 8
  %rawNum36 = extractvalue %TrollValue %147, 1
  call void @troll_array_set(ptr %arrPtr33, i32 2, double %rawNum36)
  %148 = alloca %TrollValue, align 8
  %149 = getelementptr inbounds nuw %TrollValue, ptr %148, i32 0, i32 0
  %150 = getelementptr inbounds nuw %TrollValue, ptr %148, i32 0, i32 1
  store i32 0, ptr %149, align 4
  store double 0.000000e+00, ptr %150, align 8
  %151 = load %TrollValue, ptr %148, align 8
  %rawNum37 = extractvalue %TrollValue %151, 1
  call void @troll_array_set(ptr %arrPtr33, i32 3, double %rawNum37)
  %152 = alloca %TrollValue, align 8
  %153 = getelementptr inbounds nuw %TrollValue, ptr %152, i32 0, i32 0
  %154 = getelementptr inbounds nuw %TrollValue, ptr %152, i32 0, i32 2
  store i32 1, ptr %153, align 4
  store ptr %arrPtr33, ptr %154, align 8
  %155 = load %TrollValue, ptr %152, align 8
  %h = alloca %TrollValue, align 8
  store %TrollValue %155, ptr %h, align 8
  %arrPtr38 = call ptr @troll_create_array(i32 2)
  %156 = alloca %TrollValue, align 8
  %157 = getelementptr inbounds nuw %TrollValue, ptr %156, i32 0, i32 0
  %158 = getelementptr inbounds nuw %TrollValue, ptr %156, i32 0, i32 1
  store i32 0, ptr %157, align 4
  store double 0.000000e+00, ptr %158, align 8
  %159 = load %TrollValue, ptr %156, align 8
  %rawNum39 = extractvalue %TrollValue %159, 1
  call void @troll_array_set(ptr %arrPtr38, i32 0, double %rawNum39)
  %160 = alloca %TrollValue, align 8
  %161 = getelementptr inbounds nuw %TrollValue, ptr %160, i32 0, i32 0
  %162 = getelementptr inbounds nuw %TrollValue, ptr %160, i32 0, i32 1
  store i32 0, ptr %161, align 4
  store double 0.000000e+00, ptr %162, align 8
  %163 = load %TrollValue, ptr %160, align 8
  %rawNum40 = extractvalue %TrollValue %163, 1
  call void @troll_array_set(ptr %arrPtr38, i32 1, double %rawNum40)
  %164 = alloca %TrollValue, align 8
  %165 = getelementptr inbounds nuw %TrollValue, ptr %164, i32 0, i32 0
  %166 = getelementptr inbounds nuw %TrollValue, ptr %164, i32 0, i32 2
  store i32 1, ptr %165, align 4
  store ptr %arrPtr38, ptr %166, align 8
  %167 = load %TrollValue, ptr %164, align 8
  %y = alloca %TrollValue, align 8
  store %TrollValue %167, ptr %y, align 8
  %w141 = load %TrollValue, ptr %w1, align 8
  %b142 = load %TrollValue, ptr %b1, align 8
  %x43 = load %TrollValue, ptr %x, align 8
  %h44 = load %TrollValue, ptr %h, align 8
  %168 = alloca %TrollValue, align 8
  %169 = getelementptr inbounds nuw %TrollValue, ptr %168, i32 0, i32 0
  %170 = getelementptr inbounds nuw %TrollValue, ptr %168, i32 0, i32 1
  store i32 0, ptr %169, align 4
  store double 4.000000e+00, ptr %170, align 8
  %171 = load %TrollValue, ptr %168, align 8
  %172 = alloca %TrollValue, align 8
  %173 = getelementptr inbounds nuw %TrollValue, ptr %172, i32 0, i32 0
  %174 = getelementptr inbounds nuw %TrollValue, ptr %172, i32 0, i32 1
  store i32 0, ptr %173, align 4
  store double 3.000000e+00, ptr %174, align 8
  %175 = load %TrollValue, ptr %172, align 8
  %176 = alloca %TrollValue, align 8
  %177 = getelementptr inbounds nuw %TrollValue, ptr %176, i32 0, i32 0
  %178 = getelementptr inbounds nuw %TrollValue, ptr %176, i32 0, i32 1
  store i32 0, ptr %177, align 4
  store double 1.000000e+00, ptr %178, align 8
  %179 = load %TrollValue, ptr %176, align 8
  %calltmp = call %TrollValue @dense(%TrollValue %w141, %TrollValue %b142, %TrollValue %x43, %TrollValue %h44, %TrollValue %171, %TrollValue %175, %TrollValue %179)
  %w245 = load %TrollValue, ptr %w2, align 8
  %b246 = load %TrollValue, ptr %b2, align 8
  %h47 = load %TrollValue, ptr %h, align 8
  %y48 = load %TrollValue, ptr %y, align 8
  %180 = alloca %TrollValue, align 8
  %181 = getelementptr inbounds nuw %TrollValue, ptr %180, i32 0, i32 0
  %182 = getelementptr inbounds nuw %TrollValue, ptr %180, i32 0, i32 1
  store i32 0, ptr %181, align 4
  store double 2.000000e+00, ptr %182, align 8
  %183 = load %TrollValue, ptr %180, align 8
  %184 = alloca %TrollValue, align 8
  %185 = getelementptr inbounds nuw %TrollValue, ptr %184, i32 0, i32 0
  %186 = getelementptr inbounds nuw %TrollValue, ptr %184, i32 0, i32 1
  store i32 0, ptr %185, align 4
  store double 4.000000e+00, ptr %186, align 8
  %187 = load %TrollValue, ptr %184, align 8
  %188 = alloca %TrollValue, align 8
  %189 = getelementptr inbounds nuw %TrollValue, ptr %188, i32 0, i32 0
  %190 = getelementptr inbounds nuw %TrollValue, ptr %188, i32 0, i32 1
  store i32 0, ptr %189, align 4
  store double 0.000000e+00, ptr %190, align 8
  %191 = load %TrollValue, ptr %188, align 8
  %calltmp49 = call %TrollValue @dense(%TrollValue %w245, %TrollValue %b246, %TrollValue %h47, %TrollValue %y48, %TrollValue %183, %TrollValue %187, %TrollValue %191)
  %h50 = load %TrollValue, ptr %h, align 8
  %192 = extractvalue %TrollValue %h50, 0
  %193 = extractvalue %TrollValue %h50, 1
  %194 = extractvalue %TrollValue %h50, 2
  call void @troll_print_value(i32 %192, double %193, ptr %194)
  %y51 = load %TrollValue, ptr %y, align 8
  %195 = extractvalue %TrollValue %y51, 0
  %196 = extractvalue %TrollValue %y51, 1
  %197 = extractvalue %TrollValue %y51, 2
  call void @troll_print_value(i32 %195, double %196, ptr %197)
  %y52 = load %TrollValue, ptr %y, align 8
  %198 = alloca %TrollValue, align 8
  %199 = getelementptr inbounds nuw %TrollValue, ptr %198, i32 0, i32 0
  %200 = getelementptr inbounds nuw %TrollValue, ptr %198, i32 0, i32 1
  store i32 0, ptr %199, align 4
  store double 2.000000e+00, ptr %200, align 8
  %201 = load %TrollValue, ptr %198, align 8
  %calltmp53 = call %TrollValue @argmax(%TrollValue %y52, %TrollValue %201)
  %202 = extractvalue %TrollValue %calltmp53, 0
  %203 = extractvalue %TrollValue %calltmp53, 1
  %204 = extractvalue %TrollValue %calltmp53, 2
  call void @troll_print_value(i32 %202, double %203, ptr %204)
  ret i32 0
}

define %TrollValue @dot(%TrollValue %w, %TrollValue %x, %TrollValue %row, %TrollValue %n) {
entry:
  %w1 = alloca %TrollValue, align 8
  store %TrollValue %w, ptr %w1, align 8
  %x2 = alloca %TrollValue, align 8
  store %TrollValue %x, ptr %x2, align 8
  %row3 = alloca %TrollValue, align 8
  store %TrollValue %row, ptr %row3, align 8
  %n4 = alloca %TrollValue, align 8
  store %TrollValue %n, ptr %n4, align 8
  %0 = alloca %TrollValue, align 8
  %1 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 0
  %2 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 1
  store i32 0, ptr %1, align 4
  store double 0.000000e+00, ptr %2, align 8
  %3 = load %TrollValue, ptr %0, align 8
  %s = alloca %TrollValue, align 8
  store %TrollValue %3, ptr %s, align 8
  %4 = alloca %TrollValue, align 8
  %5 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 0
  %6 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 1
  store i32 0, ptr %5, align 4
  store double 0.000000e+00, ptr %6, align 8
  %7 = load %TrollValue, ptr %4, align 8
  %j = alloca %TrollValue, align 8
  store %TrollValue %7, ptr %j, align 8
  br label %loopcond

loopcond:                                         ; preds = %loopbody, %entry
  %j5 = load %TrollValue, ptr %j, align 8
  %n6 = load %TrollValue, ptr %n4, align 8
  %rawNum = extractvalue %TrollValue %j5, 1
  %rawNum7 = extractvalue %TrollValue %n6, 1
  %8 = fcmp olt double %rawNum, %rawNum7
  %9 = alloca %TrollValue, align 8
  %10 = getelementptr inbounds nuw %TrollValue, ptr %9, i32 0, i32 0
  store i32 2, ptr %10, align 4
  %11 = uitofp i1 %8 to double
  %12 = getelementptr inbounds nuw %TrollValue, ptr %9, i32 0, i32 1
  store double %11, ptr %12, align 8
  %13 = load %TrollValue, ptr %9, align 8
  %rawNum8 = extractvalue %TrollValue %13, 1
  %loopcond9 = fcmp one double %rawNum8, 0.000000e+00
  br i1 %loopcond9, label %loopbody, label %loopend

loopbody:                                         ; preds = %loopcond
  %s10 = load %TrollValue, ptr %s, align 8
  %w11 = load %TrollValue, ptr %w1, align 8
  %row12 = load %TrollValue, ptr %row3, align 8
  %n13 = load %TrollValue, ptr %n4, align 8
  %rawNum14 = extractvalue %TrollValue %row12, 1
  %rawNum15 = extractvalue %TrollValue %n13, 1
  %14 = fmul double %rawNum14, %rawNum15
  %15 = alloca %TrollValue, align 8
  %16 = getelementptr inbounds nuw %TrollValue, ptr %15, i32 0, i32 0
  %17 = getelementptr inbounds nuw %TrollValue, ptr %15, i32 0, i32 1
  store i32 0, ptr %16, align 4
  store double %14, ptr %17, align 8
  %18 = load %TrollValue, ptr %15, align 8
  %j16 = load %TrollValue, ptr %j, align 8
  %rawNum17 = extractvalue %TrollValue %18, 1
  %rawNum18 = extractvalue %TrollValue %j16, 1
  %19 = fadd double %rawNum17, %rawNum18
  %20 = alloca %TrollValue, align 8
  %21 = getelementptr inbounds nuw %TrollValue, ptr %20, i32 0, i32 0
  %22 = getelementptr inbounds nuw %TrollValue, ptr %20, i32 0, i32 1
  store i32 0, ptr %21, align 4
  store double %19, ptr %22, align 8
  %23 = load %TrollValue, ptr %20, align 8
  %arrayPtr = extractvalue %TrollValue %w11, 2
  %rawNum19 = extractvalue %TrollValue %23, 1
  %idxInt = fptosi double %rawNum19 to i32
  %arrayVal = call double @troll_array_get(ptr %arrayPtr, i32 %idxInt)
  %24 = alloca %TrollValue, align 8
  %25 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 0
  %26 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 1
  store i32 0, ptr %25, align 4
  store double %arrayVal, ptr %26, align 8
  %27 = load %TrollValue, ptr %24, align 8
  %x20 = load %TrollValue, ptr %x2, align 8
  %j21 = load %TrollValue, ptr %j, align 8
  %arrayPtr22 = extractvalue %TrollValue %x20, 2
  %rawNum23 = extractvalue %TrollValue %j21, 1
  %idxInt24 = fptosi double %rawNum23 to i32
  %arrayVal25 = call double @troll_array_get(ptr %arrayPtr22, i32 %idxInt24)
  %28 = alloca %TrollValue, align 8
  %29 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 0
  %30 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 1
  store i32 0, ptr %29, align 4
  store double %arrayVal25, ptr %30, align 8
  %31 = load %TrollValue, ptr %28, align 8
  %rawNum26 = extractvalue %TrollValue %27, 1
  %rawNum27 = extractvalue %TrollValue %31, 1
  %32 = fmul double %rawNum26, %rawNum27
  %33 = alloca %TrollValue, align 8
  %34 = getelementptr inbounds nuw %TrollValue, ptr %33, i32 0, i32 0
  %35 = getelementptr inbounds nuw %TrollValue, ptr %33, i32 0, i32 1
  store i32 0, ptr %34, align 4
  store double %32, ptr %35, align 8
  %36 = load %TrollValue, ptr %33, align 8
  %rawNum28 = extractvalue %TrollValue %s10, 1
  %rawNum29 = extractvalue %TrollValue %36, 1
  %37 = fadd double %rawNum28, %rawNum29
  %38 = alloca %TrollValue, align 8
  %39 = getelementptr inbounds nuw %TrollValue, ptr %38, i32 0, i32 0
  %40 = getelementptr inbounds nuw %TrollValue, ptr %38, i32 0, i32 1
  store i32 0, ptr %39, align 4
  store double %37, ptr %40, align 8
  %41 = load %TrollValue, ptr %38, align 8
  store %TrollValue %41, ptr %s, align 8
  %j30 = load %TrollValue, ptr %j, align 8
  %42 = alloca %TrollValue, align 8
  %43 = getelementptr inbounds nuw %TrollValue, ptr %42, i32 0, i32 0
  %44 = getelementptr inbounds nuw %TrollValue, ptr %42, i32 0, i32 1
  store i32 0, ptr %43, align 4
  store double 1.000000e+00, ptr %44, align 8
  %45 = load %TrollValue, ptr %42, align 8
  %rawNum31 = extractvalue %TrollValue %j30, 1
  %rawNum32 = extractvalue %TrollValue %45, 1
  %46 = fadd double %rawNum31, %rawNum32
  %47 = alloca %TrollValue, align 8
  %48 = getelementptr inbounds nuw %TrollValue, ptr %47, i32 0, i32 0
  %49 = getelementptr inbounds nuw %TrollValue, ptr %47, i32 0, i32 1
  store i32 0, ptr %48, align 4
  store double %46, ptr %49, align 8
  %50 = load %TrollValue, ptr %47, align 8
  store %TrollValue %50, ptr %j, align 8
  br label %loopcond

loopend:                                          ; preds = %loopcond
  %s33 = load %TrollValue, ptr %s, align 8
  ret %TrollValue %s33
}

define %TrollValue @relu(%TrollValue %v) {
entry:
  %v1 = alloca %TrollValue, align 8
  store %TrollValue %v, ptr %v1, align 8
  %v2 = load %TrollValue, ptr %v1, align 8
  %0 = alloca %TrollValue, align 8
  %1 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 0
  %2 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 1
  store i32 0, ptr %1, align 4
  store double 0.000000e+00, ptr %2, align 8
  %3 = load %TrollValue, ptr %0, align 8
  %rawNum = extractvalue %TrollValue %v2, 1
  %rawNum3 = extractvalue %TrollValue %3, 1
  %4 = fcmp ogt double %rawNum, %rawNum3
  %5 = alloca %TrollValue, align 8
  %6 = getelementptr inbounds nuw %TrollValue, ptr %5, i32 0, i32 0
  store i32 2, ptr %6, align 4
  %7 = uitofp i1 %4 to double
  %8 = getelementptr inbounds nuw %TrollValue, ptr %5, i32 0, i32 1
  store double %7, ptr %8, align 8
  %9 = load %TrollValue, ptr %5, align 8
  %rawNum4 = extractvalue %TrollValue %9, 1
  %ifcond = fcmp one double %rawNum4, 0.000000e+00
  br i1 %ifcond, label %then, label %else

then:                                             ; preds = %entry
  %v5 = load %TrollValue, ptr %v1, align 8
  ret %TrollValue %v5

else:                                             ; preds = %entry
  br label %ifcont

ifcont:                                           ; preds = %else
  %10 = alloca %TrollValue, align 8
  %11 = getelementptr inbounds nuw %TrollValue, ptr %10, i32 0, i32 0
  %12 = getelementptr inbounds nuw %TrollValue, ptr %10, i32 0, i32 1
  store i32 0, ptr %11, align 4
  store double 0.000000e+00, ptr %12, align 8
  %13 = load %TrollValue, ptr %10, align 8
  ret %TrollValue %13
}

define %TrollValue @dense(%TrollValue %w, %TrollValue %b, %TrollValue %x, %TrollValue %out, %TrollValue %rows, %TrollValue %n, %TrollValue %act) {
entry:
  %w1 = alloca %TrollValue, align 8
  store %TrollValue %w, ptr %w1, align 8
  %b2 = alloca %TrollValue, align 8
  store %TrollValue %b, ptr %b2, align 8
  %x3 = alloca %TrollValue, align 8
  store %TrollValue %x, ptr %x3, align 8
  %out4 = alloca %TrollValue, align 8
  store %TrollValue %out, ptr %out4, align 8
  %rows5 = alloca %TrollValue, align 8
  store %TrollValue %rows, ptr %rows5, align 8
  %n6 = alloca %TrollValue, align 8
  store %TrollValue %n, ptr %n6, align 8
  %act7 = alloca %TrollValue, align 8
  store %TrollValue %act, ptr %act7, align 8
  %0 = alloca %TrollValue, align 8
  %1 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 0
  %2 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 1
  store i32 0, ptr %1, align 4
  store double 0.000000e+00, ptr %2, align 8
  %3 = load %TrollValue, ptr %0, align 8
  %i = alloca %TrollValue, align 8
  store %TrollValue %3, ptr %i, align 8
  br label %loopcond

loopcond:                                         ; preds = %ifcont, %entry
  %i8 = load %TrollValue, ptr %i, align 8
  %rows9 = load %TrollValue, ptr %rows5, align 8
  %rawNum = extractvalue %TrollValue %i8, 1
  %rawNum10 = extractvalue %TrollValue %rows9, 1
  %4 = fcmp olt double %rawNum, %rawNum10
  %5 = alloca %TrollValue, align 8
  %6 = getelementptr inbounds nuw %TrollValue, ptr %5, i32 0, i32 0
  store i32 2, ptr %6, align 4
  %7 = uitofp i1 %4 to double
  %8 = getelementptr inbounds nuw %TrollValue, ptr %5, i32 0, i32 1
  store double %7, ptr %8, align 8
  %9 = load %TrollValue, ptr %5, align 8
  %rawNum11 = extractvalue %TrollValue %9, 1
  %loopcond12 = fcmp one double %rawNum11, 0.000000e+00
  br i1 %loopcond12, label %loopbody, label %loopend

loopbody:                                         ; preds = %loopcond
  %w13 = load %TrollValue, ptr %w1, align 8
  %x14 = load %TrollValue, ptr %x3, align 8
  %i15 = load %TrollValue, ptr %i, align 8
  %n16 = load %TrollValue, ptr %n6, align 8
  %calltmp = call %TrollValue @dot(%TrollValue %w13, %TrollValue %x14, %TrollValue %i15, %TrollValue %n16)
  %b17 = load %TrollValue, ptr %b2, align 8
  %i18 = load %TrollValue, ptr %i, align 8
  %arrayPtr = extractvalue %TrollValue %b17, 2
  %rawNum19 = extractvalue %TrollValue %i18, 1
  %idxInt = fptosi double %rawNum19 to i32
  %arrayVal = call double @troll_array_get(ptr %arrayPtr, i32 %idxInt)
  %10 = alloca %TrollValue, align 8
  %11 = getelementptr inbounds nuw %TrollValue, ptr %10, i32 0, i32 0
  %12 = getelementptr inbounds nuw %TrollValue, ptr %10, i32 0, i32 1
  store i32 0, ptr %11, align 4
  store double %arrayVal, ptr %12, align 8
  %13 = load %TrollValue, ptr %10, align 8
  %rawNum20 = extractvalue %TrollValue %calltmp, 1
  %rawNum21 = extractvalue %TrollValue %13, 1
  %14 = fadd double %rawNum20, %rawNum21
  %15 = alloca %TrollValue, align 8
  %16 = getelementptr inbounds nuw %TrollValue, ptr %15, i32 0, i32 0
  %17 = getelementptr inbounds nuw %TrollValue, ptr %15, i32 0, i32 1
  store i32 0, ptr %16, align 4
  store double %14, ptr %17, align 8
  %18 = load %TrollValue, ptr %15, align 8
  %z = alloca %TrollValue, align 8
  store %TrollValue %18, ptr %z, align 8
  %act22 = load %TrollValue, ptr %act7, align 8
  %19 = alloca %TrollValue, align 8
  %20 = getelementptr inbounds nuw %TrollValue, ptr %19, i32 0, i32 0
  %21 = getelementptr inbounds nuw %TrollValue, ptr %19, i32 0, i32 1
  store i32 0, ptr %20, align 4
  store double 0.000000e+00, ptr %21, align 8
  %22 = load %TrollValue, ptr %19, align 8
  %rawNum23 = extractvalue %TrollValue %act22, 1
  %rawNum24 = extractvalue %TrollValue %22, 1
  %23 = fcmp ogt double %rawNum23, %rawNum24
  %24 = alloca %TrollValue, align 8
  %25 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 0
  store i32 2, ptr %25, align 4
  %26 = uitofp i1 %23 to double
  %27 = getelementptr inbounds nuw %TrollValue, ptr %24, i32 0, i32 1
  store double %26, ptr %27, align 8
  %28 = load %TrollValue, ptr %24, align 8
  %rawNum25 = extractvalue %TrollValue %28, 1
  %ifcond = fcmp one double %rawNum25, 0.000000e+00
  br i1 %ifcond, label %then, label %else

loopend:                                          ; preds = %loopcond
  %out38 = load %TrollValue, ptr %out4, align 8
  ret %TrollValue %out38

then:                                             ; preds = %loopbody
  %z26 = load %TrollValue, ptr %z, align 8
  %calltmp27 = call %TrollValue @relu(%TrollValue %z26)
  store %TrollValue %calltmp27, ptr %z, align 8
  br label %ifcont

else:                                             ; preds = %loopbody
  br label %ifcont

ifcont:                                           ; preds = %else, %then
  %out28 = load %TrollValue, ptr %out4, align 8
  %i29 = load %TrollValue, ptr %i, align 8
  %z30 = load %TrollValue, ptr %z, align 8
  %arrayPtr31 = extractvalue %TrollValue %out28, 2
  %rawNum32 = extractvalue %TrollValue %i29, 1
  %idxInt33 = fptosi double %rawNum32 to i32
  %rawNum34 = extractvalue %TrollValue %z30, 1
  call void @troll_array_set(ptr %arrayPtr31, i32 %idxInt33, double %rawNum34)
  %i35 = load %TrollValue, ptr %i, align 8
  %29 = alloca %TrollValue, align 8
  %30 = getelementptr inbounds nuw %TrollValue, ptr %29, i32 0, i32 0
  %31 = getelementptr inbounds nuw %TrollValue, ptr %29, i32 0, i32 1
  store i32 0, ptr %30, align 4
  store double 1.000000e+00, ptr %31, align 8
  %32 = load %TrollValue, ptr %29, align 8
  %rawNum36 = extractvalue %TrollValue %i35, 1
  %rawNum37 = extractvalue %TrollValue %32, 1
  %33 = fadd double %rawNum36, %rawNum37
  %34 = alloca %TrollValue, align 8
  %35 = getelementptr inbounds nuw %TrollValue, ptr %34, i32 0, i32 0
  %36 = getelementptr inbounds nuw %TrollValue, ptr %34, i32 0, i32 1
  store i32 0, ptr %35, align 4
  store double %33, ptr %36, align 8
  %37 = load %TrollValue, ptr %34, align 8
  store %TrollValue %37, ptr %i, align 8
  br label %loopcond
}

define %TrollValue @argmax(%TrollValue %v, %TrollValue %n) {
entry:
  %v1 = alloca %TrollValue, align 8
  store %TrollValue %v, ptr %v1, align 8
  %n2 = alloca %TrollValue, align 8
  store %TrollValue %n, ptr %n2, align 8
  %0 = alloca %TrollValue, align 8
  %1 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 0
  %2 = getelementptr inbounds nuw %TrollValue, ptr %0, i32 0, i32 1
  store i32 0, ptr %1, align 4
  store double 0.000000e+00, ptr %2, align 8
  %3 = load %TrollValue, ptr %0, align 8
  %best = alloca %TrollValue, align 8
  store %TrollValue %3, ptr %best, align 8
  %4 = alloca %TrollValue, align 8
  %5 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 0
  %6 = getelementptr inbounds nuw %TrollValue, ptr %4, i32 0, i32 1
  store i32 0, ptr %5, align 4
  store double 1.000000e+00, ptr %6, align 8
  %7 = load %TrollValue, ptr %4, align 8
  %i = alloca %TrollValue, align 8
  store %TrollValue %7, ptr %i, align 8
  br label %loopcond

loopcond:                                         ; preds = %ifcont, %entry
  %i3 = load %TrollValue, ptr %i, align 8
  %n4 = load %TrollValue, ptr %n2, align 8
  %rawNum = extractvalue %TrollValue %i3, 1
  %rawNum5 = extractvalue %TrollValue %n4, 1
  %8 = fcmp olt double %rawNum, %rawNum5
  %9 = alloca %TrollValue, align 8
  %10 = getelementptr inbounds nuw %TrollValue, ptr %9, i32 0, i32 0
  store i32 2, ptr %10, align 4
  %11 = uitofp i1 %8 to double
  %12 = getelementptr inbounds nuw %TrollValue, ptr %9, i32 0, i32 1
  store double %11, ptr %12, align 8
  %13 = load %TrollValue, ptr %9, align 8
  %rawNum6 = extractvalue %TrollValue %13, 1
  %loopcond7 = fcmp one double %rawNum6, 0.000000e+00
  br i1 %loopcond7, label %loopbody, label %loopend

loopbody:                                         ; preds = %loopcond
  %v8 = load %TrollValue, ptr %v1, align 8
  %i9 = load %TrollValue, ptr %i, align 8
  %arrayPtr = extractvalue %TrollValue %v8, 2
  %rawNum10 = extractvalue %TrollValue %i9, 1
  %idxInt = fptosi double %rawNum10 to i32
  %arrayVal = call double @troll_array_get(ptr %arrayPtr, i32 %idxInt)
  %14 = alloca %TrollValue, align 8
  %15 = getelementptr inbounds nuw %TrollValue, ptr %14, i32 0, i32 0
  %16 = getelementptr inbounds nuw %TrollValue, ptr %14, i32 0, i32 1
  store i32 0, ptr %15, align 4
  store double %arrayVal, ptr %16, align 8
  %17 = load %TrollValue, ptr %14, align 8
  %v11 = load %TrollValue, ptr %v1, align 8
  %best12 = load %TrollValue, ptr %best, align 8
  %arrayPtr13 = extractvalue %TrollValue %v11, 2
  %rawNum14 = extractvalue %TrollValue %best12, 1
  %idxInt15 = fptosi double %rawNum14 to i32
  %arrayVal16 = call double @troll_array_get(ptr %arrayPtr13, i32 %idxInt15)
  %18 = alloca %TrollValue, align 8
  %19 = getelementptr inbounds nuw %TrollValue, ptr %18, i32 0, i32 0
  %20 = getelementptr inbounds nuw %TrollValue, ptr %18, i32 0, i32 1
  store i32 0, ptr %19, align 4
  store double %arrayVal16, ptr %20, align 8
  %21 = load %TrollValue, ptr %18, align 8
  %rawNum17 = extractvalue %TrollValue %17, 1
  %rawNum18 = extractvalue %TrollValue %21, 1
  %22 = fcmp ogt double %rawNum17, %rawNum18
  %23 = alloca %TrollValue, align 8
  %24 = getelementptr inbounds nuw %TrollValue, ptr %23, i32 0, i32 0
  store i32 2, ptr %24, align 4
  %25 = uitofp i1 %22 to double
  %26 = getelementptr inbounds nuw %TrollValue, ptr %23, i32 0, i32 1
  store double %25, ptr %26, align 8
  %27 = load %TrollValue, ptr %23, align 8
  %rawNum19 = extractvalue %TrollValue %27, 1
  %ifcond = fcmp one double %rawNum19, 0.000000e+00
  br i1 %ifcond, label %then, label %else

loopend:                                          ; preds = %loopcond
  %best24 = load %TrollValue, ptr %best, align 8
  ret %TrollValue %best24

then:                                             ; preds = %loopbody
  %i20 = load %TrollValue, ptr %i, align 8
  store %TrollValue %i20, ptr %best, align 8
  br label %ifcont

else:                                             ; preds = %loopbody
  br label %ifcont

ifcont:                                           ; preds = %else, %then
  %i21 = load %TrollValue, ptr %i, align 8
  %28 = alloca %TrollValue, align 8
  %29 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 0
  %30 = getelementptr inbounds nuw %TrollValue, ptr %28, i32 0, i32 1
  store i32 0, ptr %29, align 4
  store double 1.000000e+00, ptr %30, align 8
  %31 = load %TrollValue, ptr %28, align 8
  %rawNum22 = extractvalue %TrollValue %i21, 1
  %rawNum23 = extractvalue %TrollValue %31, 1
  %32 = fadd double %rawNum22, %rawNum23
  %33 = alloca %TrollValue, align 8
  %34 = getelementptr inbounds nuw %TrollValue, ptr %33, i32 0, i32 0
  %35 = getelementptr inbounds nuw %TrollValue, ptr %33, i32 0, i32 1
  store i32 0, ptr %34, align 4
  store double %32, ptr %35, align 8
  %36 = load %TrollValue, ptr %33, align 8
  store %TrollValue %36, ptr %i, align 8
  br label %loopcond
}
