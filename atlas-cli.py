#!/usr/bin/env python3
"""
ATLAS AI PRO - Command Line Interface
Beautiful terminal UI for all 4 AI modules
Requires: rich, requests, typer
"""

import requests
import json
import time
from typing import List, Optional
from enum import Enum
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
from rich.layout import Layout
from rich.text import Text
from rich.live import Live
from rich.syntax import Syntax
import typer
from datetime import datetime

# ============================================================================
# SETUP
# ============================================================================

console = Console()
app = typer.Typer(
    name="ATLAS AI PRO",
    help="🔷 Enterprise-Grade Multi-Module AI System",
    rich_markup_mode="rich"
)
API_URL = "http://localhost:8000"

class Color(str, Enum):
    PURPLE = "purple"
    GREEN = "green"
    BLUE = "blue"
    ORANGE = "orange"
    RED = "red"

# ============================================================================
# UTILITIES
# ============================================================================

def print_banner():
    """Print beautiful banner"""
    console.print()
    console.print(Panel(
        "[bold cyan]🔷 ATLAS AI PRO[/bold cyan]\n[dim]Enterprise-Grade Multi-Module AI System[/dim]",
        border_style="purple",
        padding=(1, 2)
    ))
    console.print()

def print_success(msg: str):
    """Print success message"""
    console.print(f"[bold green]✓[/bold green] {msg}")

def print_error(msg: str):
    """Print error message"""
    console.print(f"[bold red]✗[/bold red] {msg}")

def print_info(msg: str):
    """Print info message"""
    console.print(f"[bold blue]ℹ[/bold blue] {msg}")

def poll_task(task_id: str, max_wait: int = 60):
    """Poll task until completion"""
    start_time = time.time()
    
    with Progress(
        SpinnerColumn(),
        BarColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Processing...", total=100)
        
        while time.time() - start_time < max_wait:
            try:
                response = requests.get(f"{API_URL}/api/tasks/{task_id}")
                data = response.json()
                
                progress.update(task, completed=data.get('progress', 0))
                
                if data['status'] == 'completed':
                    progress.update(task, completed=100)
                    return data
                elif data['status'] == 'failed':
                    console.print(f"[bold red]Task failed:[/bold red] {data.get('error', 'Unknown error')}")
                    return None
                
                time.sleep(2)
            except Exception as e:
                print_error(f"Error polling task: {e}")
                return None
        
        print_error(f"Task timed out after {max_wait} seconds")
        return None

def display_json_result(data: dict, title: str = "Result"):
    """Display JSON result nicely"""
    json_str = json.dumps(data, indent=2)
    syntax = Syntax(json_str, "json", theme="monokai", line_numbers=True)
    console.print(Panel(syntax, title=title, border_style="purple"))

# ============================================================================
# MODULE 1: VIDEO INTELLIGENCE
# ============================================================================

@app.command()
def video_analyze(
    url: str = typer.Argument(..., help="Video URL or file path"),
    sensitivity: float = typer.Option(0.8, "--sensitivity", "-s", min=0.0, max=1.0, help="Detection sensitivity (0-1)")
):
    """Analyze video for deepfakes"""
    print_banner()
    console.print("[bold purple]🎬 Video Intelligence[/bold purple]")
    console.print()
    
    print_info(f"Analyzing video: {url}")
    print_info(f"Sensitivity level: {sensitivity * 100:.0f}%")
    
    try:
        response = requests.post(
            f"{API_URL}/api/video/analyze",
            json={
                "url": url,
                "analysis_type": "deepfake_detection",
                "sensitivity": sensitivity
            }
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Analysis complete!")
                display_json_result(result.get('result', {}), "Analysis Result")
    
    except Exception as e:
        print_error(f"Error: {e}")

@app.command()
def video_frames(
    url: str = typer.Argument(..., help="Video URL or file path")
):
    """Extract frames from video"""
    print_banner()
    console.print("[bold purple]🎬 Frame Extraction[/bold purple]")
    console.print()
    
    print_info(f"Extracting frames from: {url}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/video/extract-frames",
            json={"url": url}
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Frame extraction complete!")
                display_json_result(result.get('result', {}), "Frames")
    
    except Exception as e:
        print_error(f"Error: {e}")

# ============================================================================
# MODULE 2: MARKET ANALYSIS
# ============================================================================

@app.command()
def market_predict(
    symbols: str = typer.Argument(..., help="Stock symbols (comma-separated: AAPL,MSFT,GOOGL)"),
    timeframe: str = typer.Option("1d", "--timeframe", "-t", help="Timeframe: 1m, 5m, 15m, 1h, 1d, 1w")
):
    """Predict stock prices"""
    print_banner()
    console.print("[bold green]📈 Market Prediction[/bold green]")
    console.print()
    
    symbol_list = [s.strip().upper() for s in symbols.split(',')]
    print_info(f"Predicting stocks: {', '.join(symbol_list)}")
    print_info(f"Timeframe: {timeframe}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/market/predict",
            json={
                "symbols": symbol_list,
                "timeframe": timeframe,
                "analysis_type": "prediction"
            }
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Prediction complete!")
                display_json_result(result.get('result', {}), "Market Prediction")
    
    except Exception as e:
        print_error(f"Error: {e}")

@app.command()
def market_sentiment(
    symbols: str = typer.Argument(..., help="Stock symbols (comma-separated)")
):
    """Analyze market sentiment"""
    print_banner()
    console.print("[bold green]💭 Sentiment Analysis[/bold green]")
    console.print()
    
    symbol_list = [s.strip().upper() for s in symbols.split(',')]
    print_info(f"Analyzing sentiment for: {', '.join(symbol_list)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/market/sentiment",
            json={"symbols": symbol_list}
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Sentiment analysis complete!")
                display_json_result(result.get('result', {}), "Sentiment Analysis")
    
    except Exception as e:
        print_error(f"Error: {e}")

# ============================================================================
# MODULE 3: WEB SCRAPER
# ============================================================================

@app.command()
def scrape_website(
    url: str = typer.Argument(..., help="Website URL to scrape"),
    depth: int = typer.Option(1, "--depth", "-d", min=1, max=5, help="Crawl depth"),
    extract_type: str = typer.Option("text", "--type", "-t", help="text, links, images, all")
):
    """Scrape and analyze website"""
    print_banner()
    console.print("[bold blue]🌐 Web Scraper[/bold blue]")
    console.print()
    
    print_info(f"Scraping: {url}")
    print_info(f"Depth: {depth}, Type: {extract_type}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/scraper/analyze",
            json={
                "url": url,
                "depth": depth,
                "extract_type": extract_type,
                "ai_analysis": True
            }
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Scraping complete!")
                display_json_result(result.get('result', {}), "Scrape Results")
    
    except Exception as e:
        print_error(f"Error: {e}")

@app.command()
def monitor_website(
    url: str = typer.Argument(..., help="Website URL to monitor"),
    interval: int = typer.Option(60, "--interval", "-i", help="Check interval in minutes")
):
    """Monitor website for changes"""
    print_banner()
    console.print("[bold blue]👁️ Website Monitor[/bold blue]")
    console.print()
    
    print_info(f"Setting up monitoring for: {url}")
    print_info(f"Check interval: {interval} minutes")
    
    try:
        response = requests.post(
            f"{API_URL}/api/scraper/monitor",
            json={"url": url}
        )
        
        data = response.json()
        print_success("Monitoring setup complete!")
        display_json_result(data, "Monitor Configuration")
    
    except Exception as e:
        print_error(f"Error: {e}")

# ============================================================================
# MODULE 4: CODE AUDITOR
# ============================================================================

@app.command()
def audit_code(
    code_file: str = typer.Argument(..., help="Path to code file"),
    language: str = typer.Option("python", "--language", "-l", help="Programming language")
):
    """Audit code file"""
    print_banner()
    console.print("[bold orange]🔍 Code Auditor[/bold orange]")
    console.print()
    
    try:
        with open(code_file, 'r') as f:
            code = f.read()
        
        print_info(f"Auditing {language} code from: {code_file}")
        print_info(f"Code size: {len(code)} bytes")
        
        response = requests.post(
            f"{API_URL}/api/audit/code",
            json={
                "code": code,
                "language": language,
                "focus_areas": ["security", "performance", "bugs", "best_practices"]
            }
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Code audit complete!")
                display_json_result(result.get('result', {}), "Audit Report")
    
    except FileNotFoundError:
        print_error(f"File not found: {code_file}")
    except Exception as e:
        print_error(f"Error: {e}")

@app.command()
def audit_repository(
    github_url: str = typer.Argument(..., help="GitHub repository URL")
):
    """Audit GitHub repository"""
    print_banner()
    console.print("[bold orange]🏢 Repository Audit[/bold orange]")
    console.print()
    
    print_info(f"Analyzing repository: {github_url}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/audit/repository",
            json={"github_url": github_url}
        )
        
        data = response.json()
        task_id = data.get('task_id')
        
        if task_id:
            result = poll_task(task_id)
            if result:
                print_success("Repository analysis complete!")
                display_json_result(result.get('result', {}), "Repository Analysis")
    
    except Exception as e:
        print_error(f"Error: {e}")

# ============================================================================
# SYSTEM COMMANDS
# ============================================================================

@app.command()
def status():
    """Check system status"""
    print_banner()
    
    try:
        response = requests.get(f"{API_URL}/health")
        data = response.json()
        
        console.print(Panel(
            f"[bold green]Status:[/bold green] {data.get('status', 'Unknown')}\n"
            f"[bold green]Version:[/bold green] {data.get('version', 'Unknown')}\n"
            f"[bold green]Modules:[/bold green] {len(data.get('modules', []))} active",
            title="System Status",
            border_style="purple"
        ))
    
    except Exception as e:
        print_error(f"Cannot connect to server: {e}")
        print_info("Make sure the backend is running: python atlas-backend.py")

@app.command()
def metrics():
    """Show system metrics"""
    print_banner()
    console.print("[bold cyan]📊 System Metrics[/bold cyan]")
    console.print()
    
    try:
        response = requests.get(f"{API_URL}/api/metrics")
        data = response.json()
        
        # Create metrics table
        table = Table(title="Module Statistics", border_style="purple")
        table.add_column("Module", style="cyan")
        table.add_column("Total", style="magenta")
        table.add_column("Completed", style="green")
        table.add_column("Failed", style="red")
        table.add_column("Success Rate", style="yellow")
        
        for module in data.get('module_stats', []):
            table.add_row(
                module['module'].replace('_', ' ').title(),
                str(module['total_tasks']),
                str(module['completed']),
                str(module['failed']),
                f"{module['success_rate']:.1f}%"
            )
        
        console.print(table)
        console.print()
        
        console.print(Panel(
            f"Total Tasks: [bold cyan]{data['total_tasks']}[/bold cyan]\n"
            f"Completed: [bold green]{data['completed_tasks']}[/bold green]\n"
            f"Failed: [bold red]{data['failed_tasks']}[/bold red]\n"
            f"Active Modules: [bold yellow]{data['active_modules']}[/bold yellow]",
            title="Overall Statistics",
            border_style="purple"
        ))
    
    except Exception as e:
        print_error(f"Error: {e}")

@app.command()
def tasks(
    limit: int = typer.Option(10, "--limit", "-l", help="Number of tasks to show"),
    module: Optional[str] = typer.Option(None, "--module", "-m", help="Filter by module")
):
    """List recent tasks"""
    print_banner()
    console.print("[bold cyan]📋 Recent Tasks[/bold cyan]")
    console.print()
    
    try:
        url = f"{API_URL}/api/tasks?limit={limit}"
        if module:
            url += f"&module={module}"
        
        response = requests.get(url)
        task_list = response.json()
        
        if not task_list:
            print_info("No tasks found")
            return
        
        table = Table(title=f"Tasks (Last {len(task_list)})", border_style="purple")
        table.add_column("ID", style="dim")
        table.add_column("Module", style="cyan")
        table.add_column("Status", style="magenta")
        table.add_column("Progress", style="yellow")
        table.add_column("Created", style="green")
        
        for task in task_list[-limit:]:
            status_color = {
                'completed': 'green',
                'processing': 'blue',
                'failed': 'red',
                'pending': 'yellow'
            }.get(task['status'], 'white')
            
            table.add_row(
                task['id'][:8] + "...",
                task['module'].replace('_', ' ').title(),
                f"[{status_color}]{task['status']}[/{status_color}]",
                f"{task['progress']}%",
                task['created_at'][:10]
            )
        
        console.print(table)
    
    except Exception as e:
        print_error(f"Error: {e}")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    app()
