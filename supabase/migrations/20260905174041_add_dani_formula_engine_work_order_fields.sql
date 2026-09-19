alter table public.dd_work_orders
  add column if not exists total_labor_hours numeric,
  add column if not exists target_margin numeric,
  add column if not exists required_resource_count integer generated always as (
    case
      when total_labor_hours is not null
       and total_labor_hours > 0
       and execution_hard_cap is not null
       and extract(epoch from execution_hard_cap) > 0
        then greatest(1, ceil(total_labor_hours / (extract(epoch from execution_hard_cap) / 3600.0)))::integer
      when baseline_resource_count is not null then baseline_resource_count
      else null
    end
  ) stored,
  add column if not exists labor_hours_per_resource numeric generated always as (
    case
      when total_labor_hours is not null
       and total_labor_hours > 0
       and (
         case
           when total_labor_hours is not null
            and total_labor_hours > 0
            and execution_hard_cap is not null
            and extract(epoch from execution_hard_cap) > 0
             then greatest(1, ceil(total_labor_hours / (extract(epoch from execution_hard_cap) / 3600.0)))::integer
           when baseline_resource_count is not null then baseline_resource_count
           else null
         end
       ) is not null
        then total_labor_hours / (
          case
            when total_labor_hours is not null
             and total_labor_hours > 0
             and execution_hard_cap is not null
             and extract(epoch from execution_hard_cap) > 0
              then greatest(1, ceil(total_labor_hours / (extract(epoch from execution_hard_cap) / 3600.0)))::integer
            when baseline_resource_count is not null then baseline_resource_count
            else null
          end
        )
      else null
    end
  ) stored,
  add column if not exists break_even_service_price numeric generated always as (
    case
      when provider_pay_amount is not null
        then provider_pay_amount
           + coalesce(materials_amount,0)
           + coalesce(travel_amount,0)
      else null
    end
  ) stored,
  add column if not exists minimum_viable_customer_price numeric generated always as (
    case
      when provider_pay_amount is not null
       and target_margin is not null
       and target_margin >= 0
       and target_margin < 1
        then (
          (provider_pay_amount + coalesce(materials_amount,0) + coalesce(travel_amount,0))
          / (1 - target_margin)
        ) + coalesce(pass_through_amount,0)
      else null
    end
  ) stored,
  add column if not exists customer_price_vs_minimum_viable numeric generated always as (
    case
      when customer_price is not null
       and provider_pay_amount is not null
       and target_margin is not null
       and target_margin >= 0
       and target_margin < 1
        then customer_price - (
          ((provider_pay_amount + coalesce(materials_amount,0) + coalesce(travel_amount,0)) / (1 - target_margin))
          + coalesce(pass_through_amount,0)
        )
      else null
    end
  ) stored,
  add column if not exists service_contribution_before_pass_through numeric generated always as (
    case
      when customer_price is not null
       and provider_pay_amount is not null
        then (customer_price - coalesce(pass_through_amount,0))
           - provider_pay_amount
           - coalesce(materials_amount,0)
           - coalesce(travel_amount,0)
      else null
    end
  ) stored,
  add column if not exists service_margin_percent numeric generated always as (
    case
      when customer_price is not null
       and customer_price - coalesce(pass_through_amount,0) > 0
       and provider_pay_amount is not null
        then (
          ((customer_price - coalesce(pass_through_amount,0))
           - provider_pay_amount
           - coalesce(materials_amount,0)
           - coalesce(travel_amount,0))
          / (customer_price - coalesce(pass_through_amount,0))
        )
      else null
    end
  ) stored;