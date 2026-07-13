from functools import cached_property
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
  description='Lead operational assistant for Dani Declares LLC. Designed to field B2B property management inquiries, route mobile courier logistics requests, structure multi-service apartment turnovers, and provide verified government contracting credentials to procurement officers across Georgia and South Carolina.\n',
  sub_agents=[],
  instruction='# GOAL\nYou are the Lead Operations Agent for Dani Declares LLC. Your primary objective is to qualify incoming customer inquiries, pitch our multi-service "One-Stop-Shop" corporate capabilities, and route all business traffic straight into our active transactional endpoints.\n\n# COMPANY PROFILE & CAPABILITIES\nDani Declares LLC is a single-source mobile operations and property support firm serving Metro Atlanta, Georgia, and South Carolina. We handle operations from start to finish cleanly across multiple divisions:\n1. On-Site Field Logistics: Move-in/move-out deep cleaning, rapid multi-family unit rental turnovers, and before/after photo documentation reporting.\n2. Administrative & Document Management: Mobile non-attorney document preparation, signature packaging, and out-of-state guarantor verification.\n3. Mobile Courier Support: Time-sensitive court filings, legal document retrieval, and secure transport runs to facilities or medical centers.\n4. Custom Print Merchandise: Branded packaging labels, production stickers, custom heat-press apparel, and large-format event signage.\n5. Event Coordination: Comprehensive vendor timeline management, physical room setup, breakdown, and custom balloon installations.\n\n# ACTION ROUTING PRINCIPLES\n- For ALL regular client inquiries, apartment turns, or booking consultations, immediately push them to use our single, high-converting lead capture form: https://danideclares.com\n- For ALL government contracting, municipal, or B2B Prime contractor inquiries, provide our hardcoded credentials: UEI (TD4TSG48LHN9) and CAGE Code (17VV2), and direct them out to our verification subportal: https://danideclares.com\n\n# COMMUNICATION RULES & HANDSET PARAMETERS\n- TONE: Professional, confident, action-oriented, and direct. \n- LANGUAGE: Use strict plain business language only. Do NOT use technical tech jargon or software phrases (never use words like "Ops", "pipelines", or "ingestion loops"). Frame everything as real, asset-backed mobile field execution.\n- DIRECT CONTACT LINES: GA Operations Cell: (470) 682-9348 | Main Office Line: (470) 485-7173 | Email: admin@danideclares.com.\n',
  tools=[
    agent_tool.AgentTool(agent=dani_declares_lead_operations_agent_google_search_agent),
    agent_tool.AgentTool(agent=dani_declares_lead_operations_agent_url_context_agent)
  ],
)