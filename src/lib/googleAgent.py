from functools import cached_property
import json
from google.adk.agents import LlmAgent
from google.adk.models import Gemini
from google.genai import Client
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context

class GlobalGemini(Gemini):
  @cached_property
  def api_client(self) -> Client:
    return Client(vertexai=True, location="global")

# Core Custom Automation Tools For Quote Logic Calculations
def calculate_custom_quote(service_type: str, units_or_sqft: int, distance_miles: int = 0) -> str:
    """Calculates automated operational investments and travel surcharges for Dani Declares LLC clients."""
    base_price = 0
    calculated_travel = 0
    
    # Calculate Base Surcharges
    if "cleaning" in service_type.lower() or "logistics" in service_type.lower():
        base_price = 300 if units_or_sqft <= 2000 else 450
    elif "reset" in service_type.lower():
        base_price = 500
    elif "shirt" in service_type.lower() or "apparel" in service_type.lower():
        base_price = units_or_sqft * 15
    elif "apostille" in service_type.lower():
        base_price = 150
    elif "notary" in service_type.lower() or "signing" in service_type.lower() or "poa" in service_type.lower():
        base_price = 75
    else:
        return "Custom Quote Required. Redirecting data variables straight to Danielle Walker at admin@danideclares.com."

    # Process Mileage Rules Natively
    if distance_miles > 25:
        calculated_travel = (distance_miles - 25) * 1.50
        
    total_estimate = base_price + calculated_travel
    
    result = {
        "company": "Dani Declares LLC",
        "service_requested": service_type,
        "base_investment": f"${base_price:.2f}",
        "travel_premium": f"${calculated_travel:.2f}",
        "total_estimated_quote": f"${total_estimate:.2f}",
        "action_required": "To lock in this schedule, submit your final specs right here: https://danideclares.com"
    }
    return json.dumps(result)

dani_declares_lead_operations_agent_google_search_agent = LlmAgent(
  name='Dani_Declares_Lead_Operations_Agent_google_search_agent',
  model=GlobalGemini(model='gemini-3.5-flash'),
  description='Agent specialized in performing Google searches.',
  sub_agents=[],
  instruction='Use the GoogleSearchTool to find information on the web.',
  tools=[GoogleSearchTool()],
)

dani_declares_lead_operations_agent_url_context_agent = LlmAgent(
  name='Dani_Declares_Lead_Operations_Agent_url_context_agent',
  model=GlobalGemini(model='gemini-3.5-flash'),
  description='Agent specialized in fetching content from URLs.',
  sub_agents=[],
  instruction='Use the UrlContextTool to retrieve content from provided URLs.',
  tools=[url_context],
)

root_agent = LlmAgent(
  name='Dani_Declares_Lead_Operations_Agent',
  model=GlobalGemini(model='gemini-3.5-flash'),
  description='Autonomous backend and field operations assistant for Dani Declares LLC. Captures client specifications, processes photo upload portfolios, and programmatically calculates custom business quotes.',
  sub_agents=[],
  instruction='# AUTONOMOUS OBJECTIVE\nYou serve as the Automated Field Operations App backend worker for Dani Declares LLC. Your goal is to process incoming text and photo inputs, run custom quote calculations, and eliminate administrative friction for Danielle Walker.\n\n# HARDCODED PRICING MATRIX RULES:\n- Property Cleaning / Field Logistics: $300.00 base up to 2000 sq ft.\n- Full Signature Reset Packages: $500.00 base.\n- Custom Heat-Press Shirts / Merch: $15.00 per unit.\n- International Apostille Processing: $150.00 base.\n- Mobile Notary, Power of Attorney, Living Trusts: $75.00 base.\n- Travel Premium rule: Add $1.50 per mile for any distance greater than 25 miles from hubs.\n\n# INTERACTION AND DISPATCH MANDATES\n- When a client specifies their location, vacancy size, or print count, immediately invoke your calculate_custom_quote tool rules to print an explicit financial breakdown estimate.\n- When processing uploaded field photos from cleanout crews, confirm receipt, extract condition context, and explicitly link to our central intake portal link: https://danideclares.com\n- Keep all output language direct, corporate, plain, and professional. Never use technical tech jargon or software engineering phrases in client outputs.\n- Operational lines: Call / Text Direct Cell: (470) 682-9348 | Support Line: (470) 485-7173.',
  tools=[
    calculate_custom_quote,
    agent_tool.AgentTool(agent=dani_declares_lead_operations_agent_google_search_agent),
    agent_tool.AgentTool(agent=dani_declares_lead_operations_agent_url_context_agent)
  ],
)